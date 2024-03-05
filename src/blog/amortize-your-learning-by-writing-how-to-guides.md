---

title: Amortize Your Learning by Writing How-To Guides
date: 2024-03-05T00:50:00
image: https://unsplash.com/photos/person-sitting-front-of-laptop-mfB1B1s4sMc
tags:
- career
- opinion

---


The time required to learn something new can be large, but you can make that cost worth it by teaching it to others.

I would even go so far as to say that it's your _responsibility_ to make it easier for the next person to learn the same topic.

_Credit to [Tanya Reilly](https://noidea.dog/) and her book [The Staff Engineer's Path](https://noidea.dog/staff) for the idea for this article. Tanya describes amortizing the cost of creating a curriculum by teaching it multiple times (p. 268), but I think the same applies to documentation, just on a smaller scale._

Here's a situation: your team uses some piece of technology, and let's say it's older or more difficult to find reliable documentation for. You spend multiple days investigating a workaround to an issue or a setting you know you want to change, but can't find anything relevant on the internet. You decide to check the code out locally yourself, and you end up further down the rabbit hole. You eventually find the functionality that you're looking for, and you're able to achieve the desired outcome.

Here's a potentially more frustrating situation: you've been tasked with modifying an older system that has very little tribal knowledge left at your company. You find some documentation and it looks promising, until you realize it's years out of date. You once again end up doing code archaeology to find what you need. You find it, spend a nightmarish amount of time testing it, and eventually make your change successfully.

What's missing from these two scenarios? _Making the life of the next person better_. You spent significant time gaining a lot of valuable context to accomplish your task - you should share that context!

## Audience one: yourself

Taking either of the above situations, let's say that you made your change and were able to move on with your life. You get to work on other projects, and life is good. But then business needs change, and you have to revisit your old friend, the poorly documented system.

_But it's been so long that you lost all of your hard-earned context._

Don't you wish that past you had left bread crumbs for future you? The code archaeology will likely take you less time your second time, but it will still be costly (and likely cause a lot of frustration). Previously spending even ten minutes to have written some documentation could have saved you days of frustration. Be selfish, leave future you some bread crumbs today!

## Audience two: your organization

If writing how-to guides for selfish reasons isn't enough motivation, try writing them for altruistic reasons.

Again taking either of the above situations, let's say that it turns out that your team needs to repeat the process somewhat frequently, and you just happened to be the first person tasked with it. If _you_ didn't enjoy the digital archaeology, it's highly likely that your teammates or colleagues won't either. Especially if you found some traps such as config parameters that seem important but don't actually control anything, or worse, parameters that control something unrelated to their name.

All of this advice is doubly important if you work on a team whose customers are other engineers at your company, such as a platform team. You should be prioritizing self-service for them so that you can focus on providing a quality product.

Here are some example how-to guides you could write today:

- Local development & testing instructions for your services, especially if they differ from your organization's norms
- Deployment steps for your services, in case multiple manual steps need coordination
- A list of custom metrics emitted by your services and what they mean
- How to use one of your team's admin tools (and no, strict RPC schemas are not self-descriptive)

## Audience three: the public

You should be motivated by both helping yourself and your colleagues, but if not, write how-to guides for clout.

If in the course of your daily tasks, you have learned something generalizable or publicly applicable, blog about it! You would be surprised how helpful it can be to someone else. If the [Reddit blackout of 2023](https://en.wikipedia.org/wiki/2023_Reddit_API_controversy) taught us anything, it's that a lot of valuable knowledge exists on the internet, and sometimes it's only in one or two Google-crawled places. You have valuable knowledge, and others should feel honored for you to share it.

I wrote [Bash Environment Variable Defaults](/blog/bash-environment-variable-defaults) because I wanted a "snack" article that was easy to write, and even though it's relatively niche, it's in my top five articles by hits. On the other hand, I wrote [Docker Shell vs. Exec Form](/blog/docker-shell-vs.-exec-form) mostly as an article to support [You Don't Need an Init System for Node.js in Docker](/blog/you-don-t-need-an-init-system-for-node.js-in-docker), but the former gets nearly 10x the hits. There is so much more information about Docker and related technologies that I thought it would get lost in the noise. But you never know what people will find valuable!

There are also selfish reasons to share information publicly, and it's ok to be selfish! Your company may have a public engineering blog that is in constant need of volunteers, and maybe contributing published articles can help you with your next promotion. Or maybe you're ready to move on from your company and you're looking to pump up your credentials. Or maybe you're trying to build a presence on social media and in engineering circles. Being publicly visible can help all of these goals!

## Closing thoughts

There's a Ralph Waldo Emerson quote from his essay titled "[Compensation](https://en.wikipedia.org/wiki/Compensation_(essay))" that gets referenced often when talking about the "pay it forward" movement:

> In the order of nature we cannot render benefits to those from whom we receive them, or only seldom. But the benefit we receive must be rendered again, line for line, deed for deed, cent for cent, to somebody. Beware of too much good staying in your hand. It will fast corrupt and worm worms. Pay it away quickly in some sort.

In that paragraph, Emerson is talking about paying debts, and the rest of the essay is about keeping one's life in balance. It's not quite the same as writing how-to guides, but I appreciate his opinion that it's one's responsibility to pass benefits on to others.
