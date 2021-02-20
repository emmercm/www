---

title: Publishing Docker Images with CircleCI
date: 2021-02-16T04:39:00
tags:
- ci-cd
- docker

---

Publishing Docker images is a common CI/CD task, and the flexibility [CircleCI](https://circleci.com/) offers makes it a great tool for the job.

## Motivation

Automated builds, when combined with tests, are a great tool to increase iteration speed on projects through time savings.

Imagine you maintain a public Docker image of an application that has frequent version changes - every time a new version is released you'll have to spend time _building_, _tagging_, _testing_, and _publishing_ a new version. Now imagine you had a tool to update the application version for you automatically in your Dockerfile, and a CI/CD pipeline that would take care of the building, tagging, testing, and publishing of the image - it could maintain itself indefinitely without your intervention.

We'll touch on the second part here, the CI/CD pipeline for Docker images.

## About CircleCI

[CircleCI](https://circleci.com/) is a generalized CI/CD tool similar to [Jenkins](https://www.jenkins.io/), [Travis CI](https://travis-ci.org/), and [GitHub Actions](https://github.com/features/actions). As of writing, it is the CI/CD tool that I have most of my personal projects using due to familiarity.

### CircleCI Terminology

In case you haven't used CircleCI before, here are some definitions for their terminology:

> **Steps** are a collection of executable commands which are run during a job. ([source](https://circleci.com/docs/2.0/jobs-steps/#steps-overview))

> **Jobs** are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM. ([source](https://circleci.com/docs/2.0/jobs-steps/#jobs-overview))

> A **workflow** is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you resolve failures sooner. ([source](https://circleci.com/docs/2.0/workflows/#overview))

## Setup

For this project you will need a few things:

- CircleCI [installed](https://circleci.com/docs/2.0/getting-started/) to your version control of choice
- A CircleCI project [set up](https://circleci.com/docs/2.0/getting-started/#setting-up-circleci) from your selected repository
- A [Docker Hub](https://hub.docker.com/) account to push your image to

## Building the image

Let's make a simple hello world Dockerfile:

```dockerfile
FROM alpine:3.13.2
CMD ["echo", "Hello world!"]
```

This can be tested with a command such as:

```shell
$ docker build --tag helloworld . && docker run helloworld
Hello world!
```

Then we'll create the beginnings of our [CircleCI config](https://circleci.com/docs/2.0/configuration-reference/) at the default location `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  build:
    # Use `docker:stable` as the Docker container to run this job in
    docker:
      - image: docker:stable

    steps:
      # Checkout the repository files
      - checkout

      # Set up a separate Docker environment to run `docker` commands in
      - setup_remote_docker

      # Build the hello world image
      - run:
          name: Build Docker image
          command: docker build --tag helloworld .
```

By default, CircleCI will execute the pipeline on every code push, so once these files are committed and pushed, CircleCI will run `docker build` and continue to on every subsequent push. The pipeline should finish in under 30 seconds, and if we see that succeed in the CircleCI UI then we know the image built successfully.

## Publishing the image

Building the Docker image is great, but that image artifact disappeared when the job finished. In order to save our work we'll want to publish the image - what this post is all about!

First, we'll want to set an image name to publish under. To keep things easier to read, I will collapse some parts of the Dockerfile that haven't changed.

```yaml
version: 2.1

# Define a common Docker container and environment for jobs
executors:
  docker-publisher:
    # Define the image tag
    environment:
      IMAGE_TAG: <username>/helloworld:latest
    # Use `docker:stable` as the Docker image for this executor
    docker:
      - image: docker:stable

jobs:
  build:
    # Use docker-publisher from above as the Docker container to run this job in
    executor: docker-publisher

    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Build Docker image
          # Tag using the image tag above
          command: docker build --tag "${IMAGE_TAG}" .
```

Replace `<username>` with your own Docker Hub username.

To save the output of the build to be used later, we'll save it to the workflow's temporary "workspace":

```yaml
version: 2.1

# executors: (collapsed)

jobs:
  build:
    executor: docker-publisher
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Build Docker image
          command: docker build --tag helloworld .

      # Archive and persist the Docker image
      - run:
          name: Archive Docker image
          command: docker save --output image.tar "${IMAGE_TAG}"
      - persist_to_workspace:
          root: .
          paths:
            - ./image.tar
```

Because the image is very small, even archiving and saving the output should still keep our build time under 30 seconds.

In order to push images to Docker Hub we'll need to supply CircleCI with our credentials. In your CircleCI project's settings there is a page to configure environment variables. We'll need a variable named `DOCKERHUB_USERNAME` with the value of your username, and one named `DOCKERHUB_PASS` with the value of a [personal access token](https://docs.docker.com/docker-hub/access-tokens/#create-an-access-token) created for CircleCI. I would recommend against saving your password in plaintext.

Now we're ready to add a job to log in to Docker Hub and push the image:

```yaml
version: 2.1

# executors: (collapsed)

jobs:
  # build: (collapsed)

  push:
    # Use docker-publisher from above as the Docker container to run this job in
    executor: docker-publisher

    steps:
      # Set up a separate Docker environment to run `docker` commands in
      - setup_remote_docker

      # Load and un-archive the Docker image
      - attach_workspace:
          at: /tmp/workspace
      - run:
          name: Load Docker image
          command: docker load --input /tmp/workspace/image.tar

      # Log in to Docker Hub and push the image
      - run:
          name: Publish Docker image
          command: |
            echo "${DOCKERHUB_PASS}" | docker login --username "${DOCKERHUB_USERNAME}" --password-stdin
            docker push "${IMAGE_TAG}"

# Run the two different jobs as a sequenced workflow
workflows:
  version: 2
  build-push:
    jobs:
      # Run the build first
      - build
      # Push the image second
      - push:
          # Build needs to finish first
          requires:
            - build
          # Only push images from the main branch
          filters:
            branches:
              only: main
```

The final `.circleci/config.yml` will look like this:

```yaml
version: 2.1

executors:
  docker-publisher:
    environment:
      IMAGE_TAG: <username>/helloworld:latest
    docker:
      - image: docker:stable

jobs:
  build:
    executor: docker-publisher
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Build Docker image
          command: docker build --tag "${IMAGE_TAG}" .
      - run:
          name: Archive Docker image
          command: docker save --output image.tar "${IMAGE_TAG}"
      - persist_to_workspace:
          root: .
          paths:
            - ./image.tar

  push:
    executor: docker-publisher
    steps:
      - setup_remote_docker
      - attach_workspace:
          at: /tmp/workspace
      - run:
          name: Load Docker image
          command: docker load --input /tmp/workspace/image.tar
      - run:
          name: Publish Docker image
          command: |
            echo "${DOCKERHUB_PASS}" | docker login --username "${DOCKERHUB_USERNAME}" --password-stdin
            docker push "${IMAGE_TAG}"

workflows:
  version: 2
  build-push:
    jobs:
      - build
      - push:
          requires:
            - build
          filters:
            branches:
              only: main
```

Upon pushing that change, CircleCI will publish a public image named `helloworld` with a single tag `latest` under your Docker Hub account. The whole pipeline should take less than 60 seconds.

## Bonus: testing the image

I've previously talked about [testing Docker images with Container Structure Test](/blog/testing-docker-images-with-container-structure-test), a great tool from Google to test your built docker images - and it's very easy to add to our CircleCI pipeline.

First, make a `container-structure-test.yml`:

```yaml
schemaVersion: 2.0.0
commandTests:
  - name: "docker run"
    # `command` is required, so we'll have it match the Dockerfile
    command: "echo"
    args: ["Hello world!"]
    expectedOutput: ["Hello world!"]
    excludedError: [".+"]
    exitCode: 0
```

This isn't a very valuable test because it replaces all the functionality of the Dockerfile, allowing for the two get out of sync - but it will work well enough to show the CircleCI config.

To run Container Structure Test in our CircleCI pipeline, add a step just after `docker build`:

```yaml
version: 2.1

# executors: (collapsed)
jobs:
  build:
    executor: docker-publisher
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Build Docker image
          command: docker build --tag "${IMAGE_TAG}" .
      # Run Container Structure Test against the built image
      - run:
          name: Test Docker image
          command: |
            apk add --no-cache curl > /dev/null
            curl -LO https://storage.googleapis.com/container-structure-test/latest/container-structure-test-linux-amd64 && chmod +x container-structure-test-linux-amd64 && mv container-structure-test-linux-amd64 /usr/local/bin/container-structure-test
            container-structure-test test --config container-structure-test.yml --image "${IMAGE_TAG}"
      # - run (collapsed)
      # - persist_to_workspace (collapsed)

  # push: (collapsed)

# workflows: (collapsed)
```

If Container Structure Test doesn't pass, it will exit with a non-zero exit code, which will fail the step and the entire job.

## Bonus: linting the Dockerfile

I've also previously talked about [linting Dockerfiles with Hadolint](/blog/linting-dockerfiles-with-hadolint), to both help enforce style guidelines and help catch potential issues. It's also a simple addition to our pipeline.

To run Hadolint, add a step just before `docker build`:

```yaml
version: 2.1

# executors: (collapsed)

jobs:
  build:
    executor: docker-publisher
    steps:
      - checkout
      - setup_remote_docker
      # Lint the Dockerfile
      - run:
          name: Lint Dockerfile
          command: docker run --rm --interactive hadolint/hadolint < Dockerfile
      - run:
          name: Build Docker image
          command: docker build --tag "${IMAGE_TAG}" .
      # - run (collapsed)
      # - persist_to_workspace (collapsed)

  # push: (collapsed)

# workflows: (collapsed)
```

If Hadolint doesn't pass, it will exit with a non-zero exit code, which will fail the step and the entire job.

## Other CI/CD tools

If CircleCI isn't the right tool for you, check out how to accomplish this same pipeline using [GitHub Actions](/blog/publishing-docker-images-with-github-actions).
