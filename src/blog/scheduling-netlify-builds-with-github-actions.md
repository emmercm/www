---

title: Scheduling Netlify Builds with GitHub Actions
image: https://unsplash.com/photos/7oh6dJVhurM
date: 2020-04-25T00:06:00
tags:
- ci-cd
- github

---

[Netlify](https://www.netlify.com/) is a popular service to host [JAMstack](https://www.netlify.com/jamstack/) websites with, and updating those websites automatically on a schedule is easy with [GitHub Actions](https://github.com/features/actions).

See "[What is the 'JAMstack'?](/blog/what-is-the-jamstack)" for a complete explanation, but JAMstack websites are completely static, pre-rendered websites hosted with a [Content Delivery Network (CDN)](https://en.wikipedia.org/wiki/Content_delivery_network).

## Netlify

Netlify is a great option for hosting small, static sites for free. As of writing they offer unlimited sites with 100 GB bandwidth and 300 build minutes per month, completely for free, all on subdomains you can choose (or with your own domain), complete with an SSL certificate you don't have to manage. This very website is hosted on Netlify for free right now.

Netlify has a feature called [Build Hooks](https://docs.netlify.com/configure-builds/build-hooks/) that lets you trigger builds (and deploys) by sending an empty `POST` request to private URLs they generate per site. This is useful for automating a build when some kind of action happens - an email is received, a message is sent in Slack, or from an external scheduling service. That last one being the focus of this article.

## GitHub Actions

GitHub Actions left beta relatively recently on [Mar 24, 2020](https://github.blog/changelog/2020-03-24-github-actions-api-is-now-generally-available/) and is a promising alternative to other CI/CD services such as [Jenkins](https://www.jenkins.io/) and [CircleCI](https://circleci.com/). It's not as mature as other options out there, but it's likely to get there with the power of [Microsoft behind them](https://blogs.microsoft.com/blog/2018/10/26/microsoft-completes-github-acquisition/).

## Setup

1. Generate a new build hook URL for your site in the [Netlify Dashboard](https://app.netlify.com/).

    Go to `Settings > Build & deploy > Build hooks > Add build hook` and give it a unique name such as "GitHub Actions."

2. Go to your repository's [secrets page](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)) and add a new secret with the name `NetlifyBuildHook` and the value of the build hook URL you just generated.

    We're using Actions secrets because the URL is sensitive enough we don't want to commit it directly to our repository.

3. In your repository, make a new YAML file at `.github/workflows/cron.yml`. The exact filename can be changed, just as long as it's in that directory.

    Fill in the file with the contents:

    ```yaml
    name: Build Cron Schedule

    on:
      schedule:
        # At noon GMT every day
        - cron: '0 12 * * *'

    jobs:
      build:
        name: Netlify Build Hook
        runs-on: ubuntu-latest
        steps:
          - name: cURL Request
            env:
              NETLIFY_BUILD_HOOK: ${{ secrets.NetlifyBuildHook }}
            run: curl -X POST -d {} "${NETLIFY_BUILD_HOOK}"
    ```

    Note that the cron timing is in GMT/UTC, not your local timezone.

    I find cron schedules difficult to understand, so I recommend websites such as [crontab.guru](https://crontab.guru) to help translate to plain English.

4. Wait for the next time your site is supposed to build and watch!

    I've found the timing is not always exact, sometimes the build will start minutes after it's supposed to, but that shouldn't be a big issue.
