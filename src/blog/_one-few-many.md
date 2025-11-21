---

title: One, Few, or Many
image: https://unsplash.com/photos/vertical-stripes-of-blue-red-and-beige-on-dark-background-TL_UPEn0Ztw
tags:
- career
- sre

---

The golden question for triaging and impact assessment.

I touch on incident severity assessment in "[An Effective Incident Runbook Template](/blog/an-effective-incident-runbook-template)," but it's kept generic enough to be applicable to many situations. But lately I've found myself repeating a phrase to colleagues while leading disaster scenario roleplaying ahead of Black Friday:

> One, few, or many.

What I mean by this is: a key way to assess the impact of an observed issue is by determining if it affects only one client/user (maybe a one-off fluke), a few clients/users (maybe an edge case), or many clients/users (a systemic problem).

Here are some concrete examples:

- A stream-consuming service has a high backlog
	- If it consumes from multiple streams, is the problem with just one stream, a few streams, or many streams? The answer could help you narrow down if it was a large influx of events, or if the service needs to be scaled.
	- If the stream is partitioned, is the backlog on one partition, a few partitions, or many partitions? The answer could help you narrow down the source of the traffic, and if processing is delayed for all events or just some.
	- If the stream has different event types in it, did the throughput change for one type, a few types, or many types?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTIwMjYwNjQ1NywtNDk3NzU3NDcyLC0yMD
EwODU4ODg5LDEyMzA1MDI5MzJdfQ==
-->