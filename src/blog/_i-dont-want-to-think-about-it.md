---

title: I Don't Want to Have to Think About It
draft: true
tags:
- ci-cd
- opinion
- microservices
- sre

---

I spent a substantial amount of time in the first half of 2025 ensuring that I don't have to think about microservices my team owns that have a low rate of change.

I joined a new team in 2025 as a few different feature teams and domains were shuffled in my organization. My new team inherited an entire domain that's adjacent to the domain they already owned, but didn't inherit almost any of the engineers who had expertise in the domain. This inherited domain is quite core to the business, so it's naturally some of the older code in the company, and it's had a chance to spawn a few different microservices. Some of the ancillary microservices have a fairly low rate of change so they haven't been invested in as heavily as the more business-critical ones.

Sometimes it helps to be the new person on a team, or in the case of these services, everyone on my team is the new person. Fresh eyes bring fresh perspectives, but also less patience for rough edges. These ancillary services had some rough edges, and my projects happened to touch most of them. I found myself repeating this phrase quite often to my teammates:

> I want to invest in these services _just enough_ that I never have to think about them again.

And when I mean never think about them again, I mean they needed:

- Automated alerting tied to SLOs and business metrics
- Safe deploys, such that CI/CD could take care of dependency updates
- Meaningful end-to-end tests that avoided mocking wherever possible

Because these services usually have a low rate of changes needed, I will eventually go back to not thinking of them when I'm working elsewhere in the codebases. And when that happens, I want to ensure that I truly don't have to reserve any brain space for them.

I'm going to group the services I encountered into some general categories, and while these won't be an exhaustive list of applicable scenarios, the mindset I want you to take away is:

_What improvements can I make now that will allow me to not waste time and brain space on this again in the future._

## Patients 1 & 2: services that were unsafe to restart

Two of the services kept queued tasks in memory, making them unsafe to restart. The problem with this is: you don't always get to choose when your services restart. Maybe your host dies and a new container needs to start, or your service runs out of memory, _or the entire department is going through a massive library migration_.

For one of the services, we wholly controlled when tasks got queued, and had a low-effort way to restart abandoned tasks. But the other service's traffic came from another team, requiring a complicated pausing of their service so that we could restart ours.

Neither scenario is acceptable. In a cloud-based world, you have to treat your service instances as [cattle, not pets](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/). Your services will restart, and I want to not have to think about them when they do.

The solution for both services was to externalize the task queue and each task's status. If you track tasks with statuses such as "queued", "in-progress", "completed", or "failed" along with a timestamp of the last time a service made progress on it, then you recover from failure. ACID-compliant DBs are going to work the best for this because

- rnd-subscriber-pruning-service's use of Spring cron, preventing safe restarts for a week
- litigator-service's in-memory job queue, preventing safe restarts ever, requiring callers to pause

## Patients 3 & 4: services with low meaningful test coverage

- batch-subscriber-processor's lack of CD tests, making the Spring Boot 3 migration dangerous
- subscription-api's lack of CD tests, creating a business risk
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEwMTA5MjI0MDcsMTQxNDk4MDE3OCwxOT
MzODQxNDEwXX0=
-->