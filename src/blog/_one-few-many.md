---

title: One, Few, or Many
image: https://unsplash.com/photos/a-close-up-of-a-computer-screen-Ke1OwjOUhm4
tags:
- career
- sre

---

The golden question for triaging and impact assessment.

I touch on incident severity assessment in "[An Effective Incident Runbook Template](/blog/an-effective-incident-runbook-template)," but it's kept generic enough to be applicable to many situations. But lately I've found myself repeating a phrase to colleagues while leading disaster scenario roleplaying ahead of Black Friday:

> One, few, or many.

What I mean by this is: a key way to assess the impact of an observed issue is by determining if it affects only one client/user (maybe a one-off fluke), a few clients/users (maybe an edge case), or many clients/users (a systemic problem).

Here are some concrete examples:

- **A RPC-serving service has a high latency**
	- If it serves multiple endpoints, is the problem with just one endpoint, a few endpoints, or many endpoints? The answer could help you determine what downstream services or data stores might be a cause.
- **A stream-consuming service has a high backlog**
	- If it consumes from multiple streams, is the problem with just one stream, a few streams, or many streams? The answer could help you determine if it was a large influx of events, or if the service needs to be scaled.
	- If the stream is partitioned, is the backlog on one partition, a few partitions, or many partitions? The answer could help determine the source of the traffic, and if processing is delayed for all events or just some.
	- If the stream has different event types in it, did the throughput change for one type, a few types, or many types?
- **An automated job has failed**
	- If jobs are run per-client, is the problem with just one client, a few clients, or many clients? The answer could help you determine if it's a data issue or a systemic issue.
	- If jobs are run per-hour or per-day, is the problem with one timeframe, a few timeframes, or many timeframes? The answer could help you determine
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4MTA3NzY1MzMsLTIyMzkzODkxMywtND
k3NzU3NDcyLC0yMDEwODU4ODg5LDEyMzA1MDI5MzJdfQ==
-->