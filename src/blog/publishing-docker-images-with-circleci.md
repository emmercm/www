---

title: Publishing Docker Images with CircleCI
date: 2030-01-01
tags:
- docker

---

[Docker Hub](https://docs.docker.com/docker-hub/builds/), [AWS CodeBuild](https://aws.amazon.com/blogs/devops/build-a-continuous-delivery-pipeline-for-your-container-images-with-amazon-ecr-as-source/), and other cloud services offer ways to automate Docker image builds - but sometimes you need finer control over things such as linting, tagging and testing. A more generalized CI/CD tool such as [CircleCI](https://circleci.com/) can provide that.

## Motivation

Automated builds, when combined with tests, are a great tool to increase iteration speed on projects through time savings.

Imagine you maintain a public Docker image of an application that has frequent version changes - every time a new version is released you'll have to spend time _building_, _tagging_, _testing_, and _publishing_ a new version. Now imagine you had a tool to update the application version for you automatically in your Dockerfile, and a CI/CD pipeline that would take care of the building, tagging, testing, and publishing of the image - it could maintain itself indefinitely without your intervention.

We'll touch on the second part here, the CI/CD pipeline for Docker images.

## CircleCI Terminology

In case you haven't used CircleCI before, here are some definitions for their terminology:

> **Steps** are a collection of executable commands which are run during a job. ([source](https://circleci.com/docs/2.0/jobs-steps/#steps-overview))

> **Jobs** are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM. ([source](https://circleci.com/docs/2.0/jobs-steps/#jobs-overview))

> A **workflow** is a set of rules for defining a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you resolve failures sooner. ([source](https://circleci.com/docs/2.0/workflows/#overview))

## Automatically building the image

- basic Dockerfile
- basic config.yaml

## Automatically publishing the image

- add docker login step
- add docker publish step

## Automatically linting the Dockerfile

- link out to hadolint post
- show hadolint as a step before build

## Automatically testing the image

- link out to CST post
- show CST as a step before publish

---

Having a consistent way to run code builds and produce results is important for any setup, and Docker is no exception.

As I touched on in "[Keep Docker Base Images Updated with Renovate](/blog/keep-docker-base-images-updated-with-renovate/#pinning-docker-image-digests)", reproducible builds should be a goal of any code build setup, and Docker is no exception.

[https://medium.com/@_oleksii_/set-up-automated-builds-using-github-and-docker-hub-12c3e0f18eba](https://medium.com/@_oleksii_/set-up-automated-builds-using-github-and-docker-hub-12c3e0f18eba)
