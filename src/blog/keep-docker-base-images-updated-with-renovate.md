---

title: Keep Docker Base Images Updated with Renovate
date: 2020-07-30T23:18:00
tags:
- docker
- ci-cd
- renovate

---

Just like with libraries used in code, keeping your Docker base images up to date is a good security practice.

## Docker

All images, especially base images, have a number of potentially vulnerable areas:

- Large images, in general, have a larger surface area for vulnerabilities
- Running as the default user (root) can give the container elevated access on the host machine
- Poorly configured defaults can expose sensitive information
- Bundled system libraries could have known vulnerabilities
- In images such as [Alpine Linux](https://alpinelinux.org/), versions of packages available in the package repository are tightly coupled with the image version, so old images don't get updated packages

Plus, if you're using a language base image such as `golang:1.14` or `node:14.7`, keeping it up to date means you'll have access to all the latest and greatest language features.

## Renovate

[Renovate](https://renovate.whitesourcesoftware.com/) is a [completely free](https://renovate.whitesourcesoftware.com/blog/renovate-is-now-part-of-whitesource/), open source tool to **automate dependency updates** across many tools and languages. With Renovate, you can either install it into GitHub or GitLab as an app, or self-host. You commit a config file [in your repository](https://docs.renovatebot.com/configuration-options/) alongside the rest of your code, and Renovate will use it every time it runs.

See my other article "[Keep npm Packages Updated with Renovate](/blog/keep-npm-packages-updated-with-renovate)" on how Renovate can be used to keep libraries up to date, such as ones managed by [npm](https://www.npmjs.com/). A lot of the setup in this article is the same as that one.

For Docker specifically, Renovate can update Docker tags in a [number of places](https://docs.renovatebot.com/docker/#docker):

- The [`FROM`](https://docs.docker.com/engine/reference/builder/#from) instruction in `Dockerfile` files
- The container [`image`](https://docs.docker.com/compose/compose-file/#image) option in `docker-compose.yml` files
- CircleCI [Docker executor](https://circleci.com/docs/guides2.0/execution-managed/executor-intro/#or-types/#using-docker) images in `.circleci/config.yml` files
- Kubernetes manifests
- Ansible configuration files

For me, the killer features of Renovate for Docker are really:

- Supporting any version precision (`node:14`, `node:14.7`, `node:14.7.0`) and maintaining that precision when updating
- Understanding the canonical Docker tag structure doesn't strictly follow semantic versioning (e.g. `golang:1.14.6-alpine3.12`), but also [allowing you](https://docs.renovatebot.com/configuration-options/#versioning) to configure what versioning scheme the images do match (Gradle, Maven, pep440, etc.)
- Ability to pin image digests and keep them updated (more below)

## Pinning Docker image digests

Digest pinning is a deep enough topic that it deserves its own explanation here. The Renovate docs have a whole section on [digest pinning](https://docs.renovatebot.com/docker/#digest-pinning), but I'll do my best to summarize it.

With most package repositories (npm, PyPI, etc.) versions are immutable, meaning you can't publish the same version twice (e.g. `v1.0.0`). npm will let you "un-publish" a version within 72 hours of being published, but you can't make a fix and re-publish that same version, you have to publish a new one.

**Docker tags are not immutable.** You can publish the same tag (e.g. `node:14.7.0`) over and over and over, which leads to unreproducible builds. Docker images have a "digest," a hash computed from its manifest, and digests are the most exact way you can reference an image. So while `node:14.7.0` can change, `node:14.7.0@sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5` can't. See "[What is a Docker Digest?](/blog/what-is-a-docker-digest)" for more information on how digests are calculated.

Reproducible builds are a whole discussion on their own, but suffice it to say that they're what you should aim for.

The Renovate blog has a [good article](https://renovate.whitesourcesoftware.com/blog/overcoming-dockers-mutable-image-tags/) about how [yarn](https://yarnpkg.com/) was broken in the official Node.js Docker images when existing tags were re-published. Pinning the image digest of that base image would have protected developers from the error.

## Renovate as an app

The easiest way to use Renovate is to install the [GitHub](https://docs.renovatebot.com/getting-started/installing-onboarding/#hosted-githubcom-app) or [GitLab](https://docs.renovatebot.com/getting-started/installing-onboarding/#hosted-gitlabcom-app) app and give it access to your repositories. From there, it will automatically open an [onboarding pull request](https://docs.renovatebot.com/configuration-options/) that adds a `renovate.json` config file, and the pull request description will describe what will happen when it is merged. You can edit that `renovate.json` and the pull request description will automatically update with the new effects.

## Default Renovate config

Renovate offers [many options](https://docs.renovatebot.com/configuration-options/), and I recommend you read through them all - but they can be overwhelming, and some people may just want some reasonablsane defaults. Thankfully, there's a [base config](https://docs.renovatebot.com/presets-config/#configbase) that the onboarding pull request uses:

```json
{
  "extends": [
    "config:base"
  ]
}
```

The things I'd recommend as "must changes" are: [choosing a schedule](https://docs.renovatebot.com/presets-schedule/) such as "weekly" or "monthly", and enabling [pinning of Docker digests](https://docs.renovatebot.com/docker/#digest-pinning):

```json
{
  "extends": [
    "config:base",
    "schedule:monthly",
    "docker:pinDigests"
  ]
}
```

## Custom Renovate config

Here's my recommended config for Docker. It's in JSON5 syntax to help explain the options, so you can either put it in `renovate.json5`, or remove the comments before putting it in `renovate.json`.

```json5
{
  /***** General settings *****/

  // Use recommended defaults
  "extends": [
    "config:base"
  ],

  // Run on a monthly schedule to keep interruptions to a minimum,
  //  but always open vulnerability-fixing pull requests immediately
  "schedule": "before 9am on the first day of the month",
  "timezone": "America/Detroit",
  "vulnerabilityAlerts": {
    "labels": ["security"],
    "schedule": "at any time"
  },

  // Add your custom labels to pull requests
  "labels": ["ready for review"],

  // Avoid updating to unstable versions
  "ignoreUnstable": true,
  "stabilityDays": 7,

  /***** Docker settings *****/

  // docker:enableMajor preset, this is disabled by default
  "packageRules": [
    {
      "datasources": ["docker"],
      "updateTypes": ["major"],
      "enabled": true
    }
  ],

  // docker:pinDigests preset, this allows for reproducible builds
  "docker": {
    "pinDigests": true
  }
}
```

If you have high confidence in your CI/CD, you could even have pull requests auto-merge when they pass CI:

```json
{
  "automerge": true
}
```

### Other options

Configurations like these are never a one-size-fits-all situation, so here are some other options to think about.

You might want to **ignore Docker updates in certain directories**, such as images used by your CI/CD:

```json
{
  "packageRules": [
    {
      "paths": [".circleci/**"],
      "datasources": ["docker"],
      "enabled": false
    }
  ]
}
```

Maybe for some reason you want to **pin the major and minor versions** of some base images:

```json
{
  "packageRules": [
    {
      "paths": ["1.0/**"],
      "datasources": ["docker"],
      "major": {
        "enabled": false
      },
      "minor": {
        "enabled": false
      },
      "patch": {
        "enabled": true
      }
    }
  ]
}
```

## Conclusion

Stay safe, keep your dependencies updated!

Be smart, do it automatically!
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTAzNzQ5NjczNV19
-->