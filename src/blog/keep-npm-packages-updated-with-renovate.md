---

title: Keep npm Packages Updated with Renovate
date: 2020-07-19T21:00:00
tags:
- node.js
- ci-cd

---

It's important to keep your [npm](https://www.npmjs.com/) packages updated for [security](https://snyk.io/blog/ten-npm-security-best-practices/) [reasons](https://snyk.io/blog/how-to-maintain-npm-dependencies-in-your-project/), and it's really easy to do automatically with [Renovate](https://renovate.whitesourcesoftware.com/).

## Renovate

[Renovate](https://renovate.whitesourcesoftware.com/) is a [completely free](https://renovate.whitesourcesoftware.com/blog/renovate-is-now-part-of-whitesource/), open source tool to **automate dependency updates** across many tools and languages. With Renovate, you can either install it into GitHub or GitLab as an app, or self-host. You commit a config file [in your repository](https://docs.renovatebot.com/configuration-options/) alongside the rest of your code, and Renovate will use it every time it runs.

There are competing tools such as [Dependabot](https://dependabot.com/) ([acquired by GitHub](https://dependabot.com/blog/hello-github/)) or [Snyk](https://snyk.io/blog/keep-your-dependencies-up-to-date-enable-auto-upgrades-with-snyk/) that do similar things, but I have really appreciated the deep customization Renovate offers.

## npm

npm packages are a great tool to speed up development, but they're also a **large source of vulnerabilities**. Vulnerabilities such as [prototype pollution](https://www.npmjs.com/advisories/782), [regex denial of service](https://www.npmjs.com/advisories/118), and [remote code execution](https://www.npmjs.com/advisories/1538) can be common in npm packages. Maintainers of popular packages tend to do a good job releasing updates when a vulnerability is found, so keeping your dependencies up-to-date is important.

Even with automatic npm updates, there's **no guarantee the package maintainer will keep _their_ dependencies updated**, which is why it's important to only use libraries that are actively maintained, and preferably have more than one contributor - but you'll need to use your best judgement as there may not be very many options. Snyk has a good article on [maintaining npm dependencies](https://snyk.io/blog/how-to-maintain-npm-dependencies-in-your-project/).

## Renovate as an app

The easiest way to use Renovate is to install the [GitHub](https://docs.renovatebot.com/getting-started/installing-onboarding/#hosted-githubcom-app) or [GitLab](https://docs.renovatebot.com/getting-started/installing-onboarding/#hosted-gitlabcom-app) app and give it access to your repositories. From there, it will automatically open an [onboarding pull request](https://docs.renovatebot.com/configuration-options/) that adds a `renovate.json` config file, and the pull request description will describe what will happen when it is merged. You can edit that `renovate.json` and the pull request description will automatically update with the new effects.

## Default Renovate config

Renovate offers [many options](https://docs.renovatebot.com/configuration-options/), and I recommend you read through them all - but they can be overwhelming, and some people may just want some sane defaults. Thankfully there's a [base config](https://docs.renovatebot.com/presets-config/#configbase) that the onboarding pull request uses:

```json
{
  "extends": [
    "config:base"
  ]
}
```

The only thing I'd recommend as a "must change" is [choosing a schedule](https://docs.renovatebot.com/presets-schedule/) such as "weekly" or "monthly":

```json
{
  "extends": [
    "config:base",
    "schedule:monthly"
  ]
}
```

## Custom Renovate config

Here's my recommended config for Node.js/npm. It's in JSON5 syntax to help explain the options, so you can either put it in `renovate.json5`, or remove the comments before putting it in `renovate.json`.

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

  /***** Node.js settings *****/

  // When updating, bump version ranges (e.g. ^0.1.3 -> ^0.1.4)
  "rangeStrategy": "bump",

  // Keep package-lock.json updated, similar to `npm audit fix`
  "lockFileMaintenance": {
    "enabled": true
  },

  "packageRules": [
    // Keep Node.js (.nvmrc) updated to maintained versions
    {
      "packageNames": ["node"],
      "major": {
        "enabled": true
      },
      "separateMultipleMajor": true,
      "allowedVersions": "^10 || ^12 || ^14"
    },

    // Group updates into "dependencies" and "dev dependencies" rather
    //  than having a separate pull request per updated package
    {
      "depTypeList": ["dependencies"],
      "groupName": "Dependencies"
    },
    {
      "depTypeList": ["devDependencies"],
      "groupName": "Dev Dependencies"
    }
  ]
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

If you need to access **private npm registries**, you'll need to create an `.npmrc` file that uses environment variables, or use the `npmrc` option - and you'll need to provide your token(s) in an encrypted format (see the [documentation](https://docs.renovatebot.com/getting-started/private-packages/)):

```json
{
  "npmrc": "@fortawesome:registry=https://npm.fontawesome.com/\n//npm.fontawesome.com/:_authToken=${NPM_TOKEN}",
  "encrypted": {
    "npmToken": "..."
  }
}
```

If your dependencies can be split into **"front-end" and "back-end"** you might want to group update pull requests in the same way:

```json5
{
  // By default all packages are "back-end"
  "groupName": "Back-End",

  "packageRules": [
    {
      // All packages that are "front-end"
      "packageNames": [
        "bootstrap",
        "jquery"
      ],
      "groupName": "Front-End"
    }
  ]
}
```

If you mix **multiple different languages** in your repository you might want to group update pull requests by language:

```json
{
  "separateMajorMinor": true,
  "separateMinorPatch": false,

  "packageRules": [
    {
      "managers": ["circleci"],
      "updateTypes": ["minor", "patch"],
      "groupName": "CircleCI"
    },
    {
      "managers": ["dockerfile"],
      "updateTypes": ["minor", "patch"],
      "groupName": "Dockerfile"
    },
    {
      "languages": ["js"],
      "updateTypes": ["minor", "patch"],
      "groupName": "JavaScript"
    }
  ]
}
```

## Conclusion

Stay safe, keep your dependencies updated!

Be smart, do it automatically!
