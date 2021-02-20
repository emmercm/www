---

title: Publishing Docker Images with GitHub Actions
date: 2021-02-20T20:22:00
tags:
- ci-cd
- docker
- github

---

Publishing Docker images is a common CI/CD task, and the tight integration [GitHub Actions](https://github.com/features/actions) has with GitHub repositories makes it a great tool for the job.

## Motivation

Automated builds, when combined with tests, are a great tool to increase iteration speed on projects through time savings.

Imagine you maintain a public Docker image of an application that has frequent version changes - every time a new version is released you'll have to spend time _building_, _tagging_, _testing_, and _publishing_ a new version. Now imagine you had a tool to update the application version for you automatically in your Dockerfile, and a CI/CD workflow that would take care of the building, tagging, testing, and publishing of the image - it could maintain itself indefinitely without your intervention.

We'll touch on the second part here, the CI/CD workflow for Docker images.

## About GitHub Actions

GitHub Actions left beta about a [year ago](https://github.blog/changelog/2020-03-24-github-actions-api-is-now-generally-available/), and has been growing in popularity as a replacement for other CI/CD services in part to its tight integration with GitHub repositories.

As of writing, the Actions free plan offers **unlimited build minutes for public repositories**, 2,000 build minutes per month for private repositories, and 20 concurrent jobs - much more than other freemium services.

## Setup

For this project you will need a couple things:

- A [GitHub](https://github.com/) repository for your code
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

Then we'll create the beginnings of our Actions workflow at `.github/workflows/main.yml`:

```yaml
name: CI/CD

# Run on pushes to any branch
on: push

jobs:
  build:
    name: Docker build

    # Use the Ubuntu virtual environment to run this job in
    runs-on: ubuntu-latest

    steps:
      # Checkout the repository files
      - name: Checkout
        uses: actions/checkout@v2

      # Build the hello world image
      - name: Build Docker image
        run: docker build --tag helloworld .
```

With this config, GitHub Actions will execute the workflow on every code push, so once these files are committed and pushed, Actions will run `docker build` and continue to on every subsequent push. The workflow should finish in under 15 seconds, and if we see that succeed in the Actions or Pull Request UI then we know the image built successfully.

## Publishing the image

Building the Docker image is great, but that image artifact disappeared when the job finished. In order to save our work we'll want to publish the image - what this post is all about!

First, we'll want to set an image name to publish under. To keep things easier to read, I will collapse some parts of the Dockerfile that haven't changed.

```yaml
name: CI/CD

on: push

# Define the image tag
env:
  IMAGE_TAG: <username>/helloworld:latest

jobs:
  build:
    name: Docker build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build Docker image
        # Tag using the image tag above
        run: docker build --tag "${IMAGE_TAG}" .
```

Replace `<username>` with your own Docker Hub username.

To save the output of the build to be used later, we'll save it to the workflow's "artifacts":

```yaml
name: CI/CD

on: push

env:
  IMAGE_TAG: <username>/helloworld:latest

jobs:
  build:
    name: Docker build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build --tag "${IMAGE_TAG}" .

      # Archive and persist the Docker image
      - name: Save Docker image
        run: docker save --output image.tar "${IMAGE_TAG}"
      - name: Upload Docker image
        uses: actions/upload-artifact@v2
        with:
          name: docker-image
          path: image.tar
          retention-days: 1
```

Because the image is very small, even archiving and saving the output should still keep our build time under 15 seconds.

One thing to note is the action `actions/upload-artifact@v2` is very slow, I've seen it take more than _8 minutes_ for an almost 3GB Docker image. That's an extreme case, no sane image should be that large, but it's something to keep in mind.

In order to push images to Docker Hub we'll need to supply GitHub with our credentials. In your GitHub repository's settings there is a page to configure secrets. We'll need a secret named `DOCKERHUB_USERNAME` with the value of your username, and one named `DOCKERHUB_PASS` with the value of a [personal access token](https://docs.docker.com/docker-hub/access-tokens/#create-an-access-token) created for GitHub. I would recommend against saving your password in plaintext.

Now we're ready to add a job to log in to Docker Hub and push the image:

```yaml
name: CI/CD

on: push

env:
  IMAGE_TAG: <username>/helloworld:latest

jobs:
  build:
    name: Docker build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build --tag "${IMAGE_TAG}" .

      - name: Save Docker image
        run: docker save --output image.tar "${IMAGE_TAG}"
      - name: Upload Docker image
        uses: actions/upload-artifact@v2
        with:
          name: docker-image
          path: image.tar
          retention-days: 1

  push:
    name: Docker push
    runs-on: ubuntu-latest

    # Build needs to finish first
    needs: build

    # Only push images from the main branch
    if: github.ref == 'refs/heads/main'

    steps:
      # Load and un-archive the Docker image
      - name: Download Docker image
        uses: actions/download-artifact@v2
        with:
          name: docker-image
      - name: Load Docker image
        run: docker load --input image.tar

      # Log in to Docker Hub and push the image
      - name: Publish Docker image
        env:
          DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
          DOCKERHUB_PASS: ${{ secrets.DOCKERHUB_PASS }}
        run: |
          echo "${DOCKERHUB_PASS}" | docker login --username "${DOCKERHUB_USERNAME}" --password-stdin
          docker push "${IMAGE_TAG}"
```

Upon pushing that change, GitHub will publish a public image named `helloworld` with a single tag `latest` under your Docker Hub account. The whole workflow should take less than 30 seconds.

## Bonus: testing the image

I've previously talked about [testing Docker images with Container Structure Test](/blog/testing-docker-images-with-container-structure-test), a great tool from Google to test your built docker images - and it's very easy to add to our GitHub Actions workflow.

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

This isn't a very valuable test because it replaces all the functionality of the Dockerfile, allowing for the two get out of sync - but it will work well enough to show the Actions config.

To run Container Structure Test in our Actions workflow, add a step just after `docker build`:

```yaml
name: CI/CD

on: push

env:
  IMAGE_TAG: <username>/helloworld:latest

jobs:
  build:
    name: Docker build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build --tag "${IMAGE_TAG}" .

      # Run Container Structure Test against the built image
      - name: Test Docker image
        run: |
          curl -LO https://storage.googleapis.com/container-structure-test/latest/container-structure-test-linux-amd64 && chmod +x container-structure-test-linux-amd64 && sudo mv container-structure-test-linux-amd64 /usr/local/bin/container-structure-test
          container-structure-test test --config container-structure-test.yml --image "${IMAGE_TAG}"

      - name: Save Docker image
        run: docker save --output image.tar "${IMAGE_TAG}"
      - name: Upload Docker image
        uses: actions/upload-artifact@v2
        with:
          name: docker-image
          path: image.tar
          retention-days: 1

  # push: (collapsed)
```

If Container Structure Test doesn't pass, it will exit with a non-zero exit code, which will fail the step and the entire job.

## Bonus: linting the Dockerfile

I've also previously talked about [linting Dockerfiles with Hadolint](/blog/linting-dockerfiles-with-hadolint), to both help enforce style guidelines and help catch potential issues. It's also a simple addition to our workflow.

To run Hadolint, add a step just before `docker build`:

```yaml
name: CI/CD

on: push

env:
  IMAGE_TAG: <username>/helloworld:latest

jobs:
  build:
    name: Docker build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      # Lint the Dockerfile
      - name: Lint Dockerfile
        run: docker run --rm --interactive hadolint/hadolint < Dockerfile

      - name: Build Docker image
        run: docker build --tag "${IMAGE_TAG}" .

      - name: Save Docker image
        run: docker save --output image.tar "${IMAGE_TAG}"
      - name: Upload Docker image
        uses: actions/upload-artifact@v2
        with:
          name: docker-image
          path: image.tar
          retention-days: 1

  # push: (collapsed)
```

If Hadolint doesn't pass, it will exit with a non-zero exit code, which will fail the step and the entire job.

## Other CI/CD tools

If GitHub Actions isn't the right tool for you, check out how to accomplish this same workflow using [CircleCI](/blog/publishing-docker-images-with-circleci).
