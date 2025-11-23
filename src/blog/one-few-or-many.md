---

title: One, Few, or Many
date: 2025-11-23T01:13:00
image: https://unsplash.com/photos/a-close-up-of-a-computer-screen-Ke1OwjOUhm4
tags:
- career
- sre

---

The golden question for issue triaging and impact assessment.

I touch on incident severity assessment in "[An Effective Incident Runbook Template](/blog/an-effective-incident-runbook-template)," but it's kept generic enough to be applicable to many situations. But lately I've found myself repeating a phrase to colleagues while leading disaster scenario roleplaying ahead of Black Friday:

> One, few, or many.

What I mean by this is: a key way to assess the impact of an observed issue is by determining if the issue affects only one client/user (maybe a one-off fluke), a few clients/users (maybe a reproducible edge case), or many clients/users (a systemic problem).

## Examples

Here are some concrete examples of what I mean:

**An RPC-serving service has a high latency.**

- If the service has multiple endpoints, is the problem with just one endpoint, a few endpoints, or many endpoints? The answer could help you determine what downstream services or data stores might be a cause.
- If multiple data stores or queries/operations are used when processing the request, is the problem with just one query/operation, a few queries/operations, or many queries/operations? The answer could help you determine if the bottleneck is with one table/collection, an entire data store, or even with the network/egress.

**A stream-consuming service has a high backlog.**

- If the service consumes from multiple streams, is the problem with just one stream, a few streams, or many streams? The answer could help determine the source of the traffic, and what the appropriate scaling action should be.
- If the stream is partitioned, is the backlog on one partition, a few partitions, or many partitions? The answer could help determine the source of the traffic, and if processing is delayed for all events or just some.
- If the stream has different types of events in it, did the throughput change for one type, a few types, or many types?

**An automated job has failed.**

- If jobs are run per-client, is the problem with just one client, a few clients, or many clients? The answer could help you determine if it's a data issue or a systemic issue.
- If jobs are run per-hour or per-day, is the problem with one timeframe, a few timeframes, or many timeframes? The answer could help you determine if it's an intermittent or transient issue, or a complete failure that isn't going to self-resolve.

**An automated test intermittently fails.**

- If tests are run on multiple CPU architectures, is the problem with just one architecture, a few architectures, or many architectures?
- If the test is a web synthetic, did the problem occur from one region, a few regions, or many regions?

## Summary

In an incident scenario, "one, few, or many" is a great tool to help assess the severity, and it helps answer one of the first questions a stakeholder will ask: "who is affected?"

In lower-stakes situations such as addressing a bug report or a client support ticket, "one, few, or many" can help narrow down the source of a possible bug, or determine if it was a transient issue.
