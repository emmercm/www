---

title: What is the "JAMstack"?
date: 2020-04-27T02:13:00

---

Simply, it stands for: JavaScript, APIs, and Markup.

From [WTF is JAMstack?](https://jamstack.wtf/):

- **JavaScript**

    > Dynamic [front-end] functionalities are handled by JavaScript. There is no restriction on which framework or library you must use.

- **APIs**

    > Server side operations are abstracted into reusable APIs and accessed over HTTPS with JavaScript. These can be third party services or your custom function.

- **Markup**

    > Websites are served as static HTML files. These can be generated from source files, such as Markdown, using a Static Site Generator.

But what does that actually mean? Here's a single sentence description from the [JAMstack website](https://jamstack.org/):

> Fast and secure sites and apps delivered by pre-rendering files and serving them directly from a CDN, removing the requirement to manage or run web servers.

In other words, removing the operational complexity of running any servers at all, back-end or front-end.

Sites can be built by hand or with a [static site generator](https://www.staticgen.com/), the exact details aren't important, just the fact that they're deployed to a CDN of some kind.

## Benefits

- **Increased performance.**

    There are no servers so there is nothing to wait on to render content. Everything is static, and static things are fast to load.

- **Increased SEO.**

    Reduced page load times means increased SEO, plain and simple.

- **Ability to scale.**

    There are no servers so that means no multi-AZ, multi-region operational nightmares. Most CDNs offer more than a dozen edge locations worldwide, so your site will scale instantly.

- **Lower cost.**

    There are no servers so there are no server costs. You pay for CI/CD and the CDN, and with services such as [Netlify](https://www.netlify.com/) those are the same vendor.

- **Lower barrier to entry.**

    There are no servers so there are no server technologies to learn. No need to deal with Docker, Kubernetes, or any of that - if you can generate HTML, CSS, and JavaScript then you can deploy it to a CDN.

- **Increased security.**

    There are no servers so there are no public ingresses to protect and no library vulnerabilities to be exploited (though you should still keep your libraries updated).

## Dynamic content

So that sounds great - lightning-fast websites without isomorphic rendering or waiting for database and/or API calls to finish before rendering content, but what about dynamic content?

Dynamic content can still be managed by a Content Management System (CMS), but that CMS either manages files directly under your source control, or it triggers new builds of your site which pulls in content via an API. Either way the deployed site is still static and therefore pre-rendered.

## Best practices

Here are the six best practices to succeed with the JAMstack:

- **Using a Content Delivery Network.**

    The entire purpose of the JAMstack is to produce static assets that can be hosted anywhere, so a CDN is a must.

- **Using modern build tools.**

    While a static site generator isn't required, it's highly encouraged. Making use of tools such as transpilers and minifiers increases your site's compatability and performance.

- **Having automated builds.**

    This is necessary for using an external CMS as described above.

- **Using source control.**

    This is important to maintain the history of files and to reduce the complexity of the site. Plus it's necessary for automated builds.

- **Atomic deploys.**

    When your site is deployed, all assets are deployed at the exact same time. This guarantees a consistent experience.

- **Instant cache invalidation.**

    The CDN needs to invalidate its cache as soon as the atomic deploy happens, to continue to guarantee a consistent experience.

## Popular static site generators

Most JAMstack websites are probably built with a static site generator, so here's a short list of ones that are currently popular:

- [Next.js](https://nextjs.org/) (React, JavaScript)
- [Gatsby](https://www.gatsbyjs.org/) (React, JavaScript)
- [Hugo](https://gohugo.io/) (Go)
- [Nuxt.js](https://nuxtjs.org/) (Vue.js, JavaScript)
- [Jekyll](https://jekyllrb.com/) (Ruby)
- [Metalsmith](https://metalsmith.io/) (JavaScript) — _see "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project/)"_

There's probably a static site generator that matches the front-end you're most familiar with, [find one here](https://www.staticgen.com/)!

## Drawbacks

As with all technology choices there are tradeoffs:

- **No truly dynamic content.**

    You're not going to build the next big social media, e-commerce, or user-centric platform using JAMstack. Sometimes you truly need dynamic content based on a database or external APIs, especially when the content can change per user.

- **Lack of WYSIWYG.**

    Content management systems may provide some basic formatting options such as bold, italics, or hyperlinks - but they aren't going to provide tools to change your website's theme or layout, that's all part of the code that lives in your source control.

- **Long, constant builds.**

    Atomic deploys and instant cache invalidation is great and all, but if your site takes 20 minutes to build every time content changes you may want a different solution.

- **Increased cost.**

    Aren't CDNs cheaper than servers? Sure, but what if you don't need either and all you need is a cheap WordPress site. Technologies that have been around for a while such as WordPress are extremely cheap to host on many sites.

## Conclusion

The JAMstack isn't a silver bullet, but for smaller websites that don't change constantly it's a great choice.
