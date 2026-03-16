---

title: If It Doesn't Page Me, I'm Not Looking at It
date: 2026-03-16T19:08:00
image: https://unsplash.com/photos/abstract-dark-landscape-with-textured-mountain-peaks-HxtvH28DSVM
tags:
- observability
- opinion
- sre

---

If an alert isn't important enough to wake me up at 2 a.m., then it isn't important enough to interrupt my working hours.

At places I've worked, it is common for automated alerts to ping Slack channels. Over time, teams tend to build up a lot of automated alerts, either proactively, or in response to incidents. These alerts may only go to Slack and not page engineers, because the creator doesn't have conviction that it will always be severe or actionable enough to page someone. These Slack channels then get noisier and noisier over time until engineers stop paying attention to them. Which is why I say:

**If an alert is important enough to break my concentration during the day, then it should be important enough to page me at all hours of the day.**

I don't have infinite time in the day, and neither do you. We set up automated alerts because we believe these failure conditions are important enough to take us away from other work. If they're truly important enough to break my concentration, then they should page me. Context switching cost is real, and it's expensive.

Here's a quote from [Observability Engineering: Achieving Production Excellence](https://www.oreilly.com/library/view/observability-engineering/9781492076438/) that echoes how I feel:

> Becoming accustomed to alerts that are prone to false positives is a known problem and a dangerous practice. In other industries, that problem is known as normalization of deviance: a term coined during the investigation of the Challenger disaster. When individuals in an organization regularly shut off alarms or fail to take action when alarms occur, they eventually become so desensitized about the practice deviating from the expected response that it no longer feels wrong to them. Failures that are “normal” and disregarded are, at best, simply background noise. At worst, they lead to disastrous oversights from cascading system failures. (pp. 203-204)

## Matters of high import

What do I think is truly important enough to break my concentration? I'll tell you!

- **Breaking a service [SLO](/blog/slis-slos-and-slas-what-are-they) (or an SLO error budget burn rate that will imminently cause SLO breakage).**

  Clients, internal and external, rely on services maintaining their SLOs. A service breaking its SLO means that there is direct customer impact. The service might be causing it directly, or it is somehow degrading another service which is causing the customer impact.

- **Availability issues.**

  If a service isn't available, it is definitely going to break its SLOs. The lack of availability could be a bug with code, resource exhaustion (pinned CPU, full disk, saturated connection pools, etc.), or infrastructure (data stores, networking, deployment manager, etc.). The cause doesn't particularly matter, I still need to be paged.

- **Security issues.**

  If I can semi-accurately identify a breach or bot attack, I want to be paged. Both may require fast action, and both are going to be expensive.

## Matters of little import

What do I think is frequently a waste of my concentration? Anything that isn't actionable the gross majority of the time.

- **High CPU, low available memory, OOMs/restarts, high I/O.**

  So what if my service or DB has high CPU or is using a lot of memory if it's still within its availability and latency SLOs? I don't want to be paged for a situation that has minimal customer impact and possibly autorecovered before I even had a chance to look at it.

- **High rate of retries.**

  The whole point of retries is so that a intermittent failures are handled without human intervention. I don't particularly care if my service has a high retry count with processing a queue or making outbound requests if it's still within its latency SLO.

- **Low throughout.**

  It's a good idea to know when your service isn't reachable, but alerting on traffic being below a threshold is likely to give false positives depending on your traffic seasonality. Use a synthetic instead.

- **Request validation failures.**

  If a person or another service is sending bad requests to my service, and my service is rejecting those appropriately, then that's a "you" problem and not a "me" problem.

## Conclusion

The next time you see an alert that no one has acte
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE0NjQyNTc5MzcsLTEyMjc0NjQ5OTUsLT
ExMDE3OTI2NTUsOTkwNjA0NjE3LDEwMTYyNDA2MDAsLTEyNjA0
NTU2MjYsMTM0ODk5MjA2NywtODM2NjA1MTcsLTkxNzU1MjIyLC
0xNzI0NzM4MjIzXX0=
-->