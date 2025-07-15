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

I joined a new team in 2025 as a few different teams and domains were shuffled. My new team inherited an entire domain that's adjacent to the domain they already owned, but didn't inherit almost any of the engineers who had expertise in the domain. This inherited domain is quite core to the business so it's naturally some of the older code in the company, and it's had a chance to spawn a few different microservices. Some of the ancillary microservices have a fairly low rate of change so they haven't been invested in as heavily as the more business-critical ones.

Sometimes it helps to be the new person on a team, or in this case, everyone on my team is the new person when it comes to these services. Fresh eyes bring fresh perspectives, but also less patience for rough edges. And this ancillary services had some rough edges.

- rnd-subscriber-pruning-service's use of Spring cron, preventing safe restarts for a week
- batch-subscriber-processor's lack of CD tests, making the Spring Boot 3 migration dangerous
- subscription-api's lack of CD tests, creating a business risk
- litigator-service's in-memory job queue, preventing safe restarts ever, requiring callers to pause
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTQ5Mjg1NDMxOCwxOTMzODQxNDEwXX0=
-->