---

title: I Don't Want to Have to Think About It
date: 2025-07-26T19:38:00
image: https://unsplash.com/photos/a-statue-of-a-person-sitting-on-a-chair-in-front-of-a-desk-63hYwd9J0X0
tags:
- ci-cd
- opinion
- microservices
- sre

---

I spent a substantial amount of time in the first half of 2025 ensuring that I don't have to think about microservices my team owns that have a low rate of change.

I joined a new team in 2025 as a few different feature teams and domains were shuffled in my organization. My new team inherited an entire domain that's adjacent to the domain they already owned, but didn't inherit almost any of the engineers who had expertise in the domain. This inherited domain is quite core to the business, so it's naturally some of the older code in the company, and it's had enough time to spawn a few different microservices. Some of the ancillary microservices have a fairly low rate of change, so they haven't been invested in as heavily as the more business-critical ones.

Sometimes it helps to be the new person on a team, or in the case of these services, nearly everyone on my team is the new person. Fresh eyes bring fresh perspectives, but also less patience for rough edges. These ancillary services had some rough edges, and my projects happened to touch most of them. I found myself repeating this phrase quite often to my teammates:

> I want to invest in these services _just enough_ that I don't have to think about them hardly ever.

And to get to my goal, they needed:

- Automated alerting tied to SLOs and business metrics
- Safe deploys, such that CI/CD could take care of dependency updates
- Meaningful end-to-end tests that avoided mocking wherever possible

Because these services usually have a low rate of changes needed, I will eventually go back to not thinking of them when I'm working elsewhere in other services. And when that happens, I want to ensure that I truly don't have to reserve any brain space for them.

I'm going to group the services I encountered into some general categories, and while these won't be an exhaustive list of applicable scenarios, the mindset I want you to take away is:

> What improvements can I make now that will allow me to not waste time and brain space on this again in the future.

## Patients 1 & 2: services that were unsafe to restart

Two of the services kept queued tasks in memory, making them unsafe to restart. The problem with this is: you don't always get to _choose_ when your services restart. Maybe your host dies and a new container needs to start, or your service runs out of memory, _or the entire department is going through a massive library migration_.

For one of the services, my team wholly controlled when tasks got queued, and had a low-effort way to restart abandoned tasks. But the other service's traffic came from another team, requiring a complicated pausing of their service so that we could restart ours. Thankfully, they could safely pause traffic at any time of day, it would have been much worse to require their effort after working hours.

Neither scenario is acceptable. In a cloud-based world, you have to treat your service instances as [cattle, not pets](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/). Your services will restart, and I want to not have to think about them when they do.

The solution for both services was to externalize the task queue and each task's status. If you track tasks with statuses such as "queued," "in-progress," "completed," and "failed" along with a timestamp of the last time a service made progress on it, then you can recover from service restarts. ACID-compliant DBs are going to work the best for this because separate instances of the same service might fight each other to claim a task to work on. You'll want to track the last time a task made progress, or a "heartbeat" timestamp to be able to set a timeout to determine when a task has been abandoned.

After I made the two services not lose state on restart, I put them on full CI/CD with automatic deployments on dependency updates. I no longer have to think about them.

## Patients 3 & 4: services with low meaningful test coverage

I gave "the entire department is going through a massive library migration" as an example above, and that's because we are. The migration changes were largely automated, and it is the responsibility of each team to test their services to make sure the library changes didn't break them. Here's the problem: _I don't trust the tests in some of my services enough to know that I won't have runtime issues._

For two of these services, an over-use of [mocking](https://en.wikipedia.org/wiki/Mock_object) meant that some of their critical flows were never exercised fully end-to-end. I accidentally caused multiple regressions during a different project because no test fully exercised the service all the way from request, to datastore, to response. Poor code hygiene meant that I experienced a lot of null pointer exceptions because model classes didn't clearly convey what properties were optional and which weren't.

Both of these two services are API-based, so the solution was to automate running them and calling their endpoints like a real client would. And if a real client would make a series of requests, using the response from one request to assemble the next request, then the tests needed to do that, too.

These tests don't help me test correctness, such as making sure datastores have the right state after each request, but they do help me prevent regressions. Specifically in two areas:

1. I know the service starts correctly
2. I know the service won't throw any runtime exceptions during tested client flows

My goal was to gain confidence that my services wouldn't start experiencing exceptions immediately after being deployed to production. They helped protect me from myself, and they gave me confidence that sweeping upgrades to critical libraries were largely safe.

Obviously, this testing strategy isn't fool-proof. My end-to-end runtime testing doesn't have a particularly high test coverage by lines of code. Instead, it aims to cover a high percentage of API traffic. The next step I want to take with these services is to make use of [canary deployments](https://martinfowler.com/bliki/CanaryRelease.html?ref=wellarchitected) to reduce the blast radius of bugs that make their way to production.

I greatly increased my team's confidence in these services, making their deployment less of a ceremony. Adding guardrails allowed me to think less about running this service in production.
