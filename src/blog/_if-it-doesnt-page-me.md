---

title: If It Doesn't Page Me, I'm Not Looking at It
tags:
- observability
- opinion
- sre

---

If an alert isn't important enough to wake me up at 2 a.m., then it isn't important enough to interrupt my working hours.

At places I've worked, it is common for automated alerts to ping Slack channels. Over time, teams tend to build up a lot of automated alerts, either proactively, or in response to incidents. These alerts may only go to Slack and not page engineers, because the creator doesn't have conviction that it will always be severe or actionable enough to page someone. These Slack channels then get noisier and noisier over time until engineers stop paying attention to them. Which is why I say:

**If an alert is important enough to break my concentration during the day, then it should be important enough to page me at all hours of the day.**

I don't have infinite time in the day, and neither do you. We set up automated alerts because we believe these failure conditions are important enough to take us away from other work. If they're truly important enough to break my concentration, then they should page me. Context switching cost is real, and it's expensive.

## Matters of high import

What do I think is truly important enough to break my concentration? I'll tell you!

- **Breaking a service [SLO](/blog/slis-slos-and-slas-what-are-they) (or an SLO error budget burn rate that will imminently cause SLO breakage).**

  Clients, internal and external, rely on services maintaining their SLOs. A service breaking its SLO means that there is direct customer impact. The service might be causing it directly, or it is somehow degrading another servicthat service is likely to degrade other services that depend on it. Depending on how tightly-coupled services are, that could be disastrous.

- **Availability issues.**

  If a service isn't available, it is definitely going to break its SLOs. The lack of availability could be a bug with code, resource exhaustion (pinned CPU, full disk, saturated connection pools, etc.), or infrastructure (data stores, networking, deployment manager, etc.). The cause doesn't particularly matter, I still need to be paged.

- **Security issues.**

  If I can semi-accurately identify a bot attack, I want to be paged. A bot attack will likely lead to availability issues or runaway spend.

## Matters of little import

---

Becoming accustomed to alerts that are prone to false positives is a known problem and a dangerous practice. In other industries, that problem is known as normalization of deviance: a term coined during the investigation of the Challenger disaster. When individuals in an organization regularly shut off alarms or fail to take action when alarms occur, they eventually become so desensitized about the practice deviating from the expected response that it no longer feels wrong to them. Failures that are “normal” and disregarded are, at best, simply background noise. At worst, they lead to disastrous oversights from cascading system failures.

Charity Majors. Observability Engineering: Achieving Production Excellence (pp. 203-204). (Function). Kindle Edition. 
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTc0OTA5ODU5NywtMTI2MDQ1NTYyNiwxMz
Q4OTkyMDY3LC04MzY2MDUxNywtOTE3NTUyMjIsLTE3MjQ3Mzgy
MjNdfQ==
-->