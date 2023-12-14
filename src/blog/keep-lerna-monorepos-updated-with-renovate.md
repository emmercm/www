---

title: Keep Lerna Monorepos Updated with Renovate
date: 2023-11-04T16:00:00
tags:
- ci-cd
- node.js

---

Keeping dependencies up to date is important for every codebase, and there are a few strategies for [Lerna](https://lerna.js.org/) monorepos.

[I migrated 15 Node.js projects to a Lerna monorepo](/blog/migrating-existing-repos-to-a-lerna-monorepo) earlier this year for easier maintenance and then let it stagnate because so few people are using the packages. The projects previously had a [Renovate](https://www.mend.io/renovate/) config that would automatically bump the patch version & publish to npm once a month, and I wanted to bring that back.

Here's the methodology I used, and some alternatives you could consider.

## My situation

My requirements for a new Renovate setup were:

- **Separate versions** - all packages have separate versions from before they were migrated to a monorepo, and I want to keep them separate for semver reasons
- **Automated releases** - I want updates to dependencies (and not dev dependencies) to bump each package's patch version, such that they will be automatically published to npm
- **Minimal oversight** - I haven't been investing in these packages due to their low usage, so I want their ongoing maintenance to be as automated as possible
- **Limited schedule** - to reduce the potential spam of new versions being published to npm, I want to limit automated version bumps to once a month

## Strategy: grouping dependency types

My packages share a lot of the same libraries, especially dev dependencies such as [Jest](https://jestjs.io/) and [ESLint](https://eslint.org/). Each package has its own `package.json` that contains out these libraries and their version range.

By default, Renovate will create one pull request per library being updated, and every usage of that library will be updated at once. That means only a single pull request would be opened for a single ESLint update, and it would update every `package.json` file at once.

That's great, that's what I want! That keeps the amount of pull requests being created to a minimum, and I'd rather every Lerna package have the same library versions. But that can still be a lot of pull request spam if you make use of a lot of libraries.

I like grouping by dependency types (dependency, dev dependency, peer dependency, etc.), with major version updates of any kind always being in their own pull request. This type of grouping runs the risk of a single faulty patch or minor version update holding back updates to other libraries, but that's acceptable to me.

The Renovate config for that would look something like this:

```json5
{
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: ['config:recommended'],

  // If multiple major updates are available, create a separate pull request for each
  separateMultipleMajor: true,

  npm: {
    packageRules: [
      // Dependencies
      {
        // Group non-major dependency updates together
        groupName: 'dependencies',
        matchDepTypes: ['dependencies'],
        matchUpdateTypes: ['patch', 'minor']
      },

      // Dev dependencies
      {
        // Group non-major devDependencies together
        matchDepTypes: ['devDependencies'],
        groupName: 'dev dependencies',
        matchUpdateTypes: ['patch', 'minor']
      },
      {
        // Group ESLint together
        matchPackagePatterns: [
          '^@typescript-eslint',
          '^eslint'
        ],
        groupName: 'ESLint'
      },
      {
        // Group Jest together
        matchPackageNames: [
          '@jest/globals',
          '@types/jest',
          'jest',
          'jest-junit',
          'ts-jest'
        ],
        groupName: 'Jest',
      },
      {
        // Separate Lerna
        matchPackageNames: ['lerna'],
        groupName: 'Lerna',
        prPriority: -10
      },

      // Everything else
      {
        matchDepTypes: ['optionalDependencies', 'peerDependencies', 'engines'],
        enabled: false
      }
    ]
  }
}
```

That will cut down on a lot of pull requests!

## Alternative strategy: grouping by Lerna package

Maybe you would prefer to manage each package separately, creating separate pull requests for each package. Doing so will likely increase the number of pull requests, but it means library updates affecting one Lerna package won't hold back updates to other packages.

The Renovate config for that would look something like this:

```json5
{
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: ['config:recommended'],

  npm: {
    // Group by each package.json's parent directory name
    additionalBranchPrefix: '{{{parentDir}}}-',
    commitMessagePrefix: '{{#if parentDir}}{{{parentDir}}}:{{/if}}',

    packageRules: [
      {
        // Group non-major dependency updates together
        groupName: 'non-major dependencies',
        matchUpdateTypes: ['patch', 'minor']
      }
    ]
  }
}
```

## Strategy: automatic version bumps

I have a GitHub Action workflow that runs `lerna publish` on every commit to the `main` branch. This ensures that any version bump in any pull request will result in a release.

Because I want Renovate dependency updates to be as automated as possible, I want the patch version of every relevant `package.json` to get bumped on dependency updates only (not dev dependencies, peer dependencies, etc.).

The Renovate config for that would look something like this:

```json5
{
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: ['config:recommended'],

  // Automatically merge PRs without a human approval, creating automated releases
  automerge: true,
  platformAutomerge: true,

  npm: {
    // Bump version ranges even if the new library version is in the old range
    rangeStrategy: 'bump',

    packageRules: [
      {
        // Dependency updates bump the patch version
        matchDepTypes: ['dependencies'],
        bumpVersion: 'patch'
      }
    ]
  }
}
```

## Strategy: reducing pull request spam

Because I want dependency updates to create new patch versions, this has the possibility of publishing new versions to npm frequently. That would be really annoying to users, so I want to reduce how often versions might get published.

There are a few Renovate settings you should consider:

```json5
{
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: ['config:recommended'],

  // Open PRs immediately for vulnerability alerts, ignoring any other schedule
  // Requires "dependency graph" as well as Dependabot "alerts" and "security updates" enabled for the repo
  vulnerabilityAlerts: {
    // Renovate's defaults for `vulnerabilityAlerts`
    groupName: null,
    schedule: [],
    dependencyDashboardApproval: false,
    minimumReleaseAge: null,
    rangeStrategy: 'update-lockfile',
    commitMessageSuffix: '[SECURITY]',
    branchTopic: '{{{datasource}}}-{{{depName}}}-vulnerability',
    prCreation: 'immediate'
  },

  // Limit dependency updates to once a month
  schedule: 'on the 1st day of the month',
  prCreation: 'immediate', // default
  prHourlyLimit: 0, // no limit
  automerge: true,
  platformAutomerge: true,

  npm: {
    // Update lockfiles, but do it one day after dependencies to reduce conflicts
    lockFileMaintenance: {
      enabled: true,
      schedule: 'on the 2nd day of the month'
    },

    packageRules: [
      // Group/separate all dependency pinning, perform it immediately
      {
        matchUpdateTypes: ['pin'],
        groupName: 'dependency ranges',
        // Renovate's defaults for these options
        schedule: 'at any time',
        prCreation: 'immediate'
      }
    ]
  }
}
```

## Bringing it all together

The current [emmercm/metalsmith-plugins Renovate config](https://github.com/emmercm/metalsmith-plugins/blob/0574701c93e70c02382e6aaccc451d7fe0735a7b/.github/renovate.json5) combines all of these strategies together, resulting in a Lerna monorepo with unattended version updates:

```json5
{
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: [
    'config:recommended',
  ],
  dependencyDashboard: true,
  configMigration: true,

  // Personal preferences
  timezone: 'America/Los_Angeles',
  assignees: ['@emmercm'],
  reviewers: ['@emmercm'],
  assignAutomerge: false, // default

  // Open PRs immediately for vulnerability alerts
  // Requires "dependency graph" as well as Dependabot "alerts" and "security updates" enabled for the repo
  vulnerabilityAlerts: {
    labels: ['security'],
    platformAutomerge: true,
    // Renovate's defaults for `vulnerabilityAlerts`
    groupName: '',
    schedule: [],
    dependencyDashboardApproval: false,
    minimumReleaseAge: '',
    rangeStrategy: 'update-lockfile',
    commitMessageSuffix: '[SECURITY]',
    branchTopic: '{{{datasource}}}-{{{depName}}}-vulnerability',
    prCreation: 'immediate',
  },
  // WARN: "When the lockfileVersion is higher than 1 in package-lock.json, remediations are only possible when changes are made to package.json."
  transitiveRemediation: true,

  // Separate potentially breaking updates, group others
  separateMultipleMajor: true,
  separateMajorMinor: true, // default
  separateMinorPatch: false, // default

  // Allow auto-merging of PRs, but reduce their spam on the commit log
  schedule: 'on the 1st day of the month',
  prCreation: 'immediate', // default
  prHourlyLimit: 0, // no limit
  automerge: true,
  platformAutomerge: true,

  // Don't update any Node.js versions (nvm, Volta, etc.)
  packageRules: [
    {
      matchCategories: ['node'],
      enabled: false
    },
  ],

  npm: {
    lockFileMaintenance: {
      // These options are required to override the `lockFileMaintenance` defaults
      enabled: true,
      schedule: 'on the 2nd day of the month', // one day after the above, to de-conflict
    },

    // Stability settings: don't raise a PR until a dependency is at least 3 days old
    rangeStrategy: 'bump',
    minimumReleaseAge: '3 days',
    internalChecksFilter: 'strict',

    packageRules: [
      // Dependencies
      {
        // Group non-major dependency updates together
        groupName: 'dependencies',
        matchDepTypes: ['dependencies'],
        matchUpdateTypes: ['patch', 'minor']
      },
      {
        // Dependency updates bump the patch version
        matchDepTypes: ['dependencies'],
        bumpVersion: 'patch'
      },

      // Dev dependencies
      {
        // Group devDependencies together
        matchDepTypes: ['devDependencies'],
        groupName: 'dev dependencies',
        // Only group non-major updates
        matchUpdateTypes: ['patch', 'minor']
      },
      {
        // Group ESLint together so files can be fixed automatically
        matchPackagePatterns: [
          '^@typescript-eslint',
          '^eslint',
        ],
        groupName: 'ESLint'
      },
      {
        // Group Jest together because of peerDependencies
        matchPackageNames: [
          '@jest/globals',
          '@types/jest',
          'jest',
          'jest-junit',
          'ts-jest',
        ],
        groupName: 'Jest'
      },
      {
        // Separate Lerna
        matchPackageNames: ['lerna'],
        groupName: 'Lerna',
        prPriority: -10,
      },

      // Group/separate all dependency pinning, perform it immediately
      {
        matchUpdateTypes: ['pin'],
        groupName: 'dependency ranges',
        // Renovate's defaults for these options
        schedule: 'at any time',
        prCreation: 'immediate',
        platformAutomerge: true
      },

      // Everything else
      {
        matchDepTypes: ['optionalDependencies', 'peerDependencies', 'engines'],
        enabled: false
      }
    ]
  }
}
```
