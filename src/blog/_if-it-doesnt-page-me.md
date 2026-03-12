---

title: If It Doesn't Page Me, I'm Not Looking at It
tags:
- observability
- opinion
- sre

---

If an alert isn't important enough to wake me up at 2 a.m., then it isn't important enough to interrupt my working hours.

At places I've worked, it is common for automated alerts to ping Slack channels. Over time, teams tend to build up a lot of automated alerts, either proactively, or in response to incidents. These alerts may only go to Slack and not page engineers, because the creator of the alert doesn't want to be the one responsible for a false positive 2 a.m. page. These Slack channels then get noisier and noisier over time until engineers stop paying attention to them. Which is why I say:

**If I need to take immediate action because of an alert, it needs to page me.**

I don't have infinite time in the day, and neither do you. We set up automated alerts because we believe these failure conditions are important enough to take us away from other work. If they're truly important enough to break my concentration, then they should page me. Context switching cost is real, and it's expensive.

## Matters of import

What do I think is truly important enough to break my concentration? I'll tell you!

- **Breaking a service [SLO](/blog/slis-slos-and-slas-what-are-they) (or an SLO error budget burn rate that will imminently cause SLO breakage).**

  Clients, internal and external, rely on services maintaining their SLOs. A service breaking its SLO means that service is likely to degrade other services that depend on it. Depending on how tightly-coupled services are, that could be disastrous.

- **Availability issues.**

  If a service isn't available, it is definitely going to break its SLOs. The lack of availability could be a bug with code, resource exhaustion (pinned CPU, full disk, saturated connection pools, etc.), or infrastructure (data stores, networking, deployment manager, etc.). The cause doesn't particularly matter, I still need to be paged.

- **Security issues.**

  If I can semi-accurately identify a bot attack, I want to be paged. A bot attack will likely lead to availability issues or runaway spend.

## Matters of little import
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTgzNjYwNTE3LC05MTc1NTIyMiwtMTcyND
czODIyM119
-->