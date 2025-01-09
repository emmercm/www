---

title: An Effective Incident Runbook Template
date: 2023-11-03T17:42:00
tags:
- career
- sre

---

A structured incident runbook that is tailored to your organization's needs is an essential tool in your SRE documentation.

What is an incident runbook? Google calls them "playbooks," but the definition in their [SRE Workbook](https://sre.google/workbook/on-call/) is nice and concise:

> Playbooks contain high-level instructions on how to respond to automated alerts. They explain the severity and impact of the alert, and include debugging suggestions and possible actions to take to mitigate the impact and fully resolve the alert. In SRE, whenever an alert is created, a corresponding playbook entry is usually created.

_Note: many organizations draw a distinction between "runbooks" and "playbooks," with "playbook" referring to an organization-specific incident response process. To be clear and consistent, I will use the phrase "incident runbooks."_

[Google estimates](https://sre.google/sre-book/introduction/) that creating incident runbooks "produces roughly a 3x improvement in [[mean time to repair (MTTR)](https://en.wikipedia.org/wiki/Mean_time_to_repair)] as compared to the strategy of 'winging it.'"

Regardless of opinions on naming, most thought leaders agree on the five A's of incident runbooks; that runbooks must be:

- **Actionable** - incident responders need clear steps to reduce MTTR human error
- **Accessible** (discoverable) - incident responders need to be able to find actionable information easily & quickly
- **Accurate** - outdated information can increase MTTR or lead to incident responders taking dangerous actions
- **Authoritative** - there should be no documents or guides that conflict with a given runbook
- **Adaptable** (evolvable) - runbooks need to be easy to update

## Foreword

Most high-SEO articles about incident response talk about how to establish an incident management process at an organization. Basically, none of these articles provide anything actionable to engineers.

_Note: I am not a security practitioner. All information contained here is aimed at SREs and engineers that participate in an on-call rotation._

For the past seven years I've worked in the U.S. e-commerce space, which means I haven't had a calm Black Friday in just as long. The companies I've worked at have all implemented some kind of change freeze leading up the Black Friday & Cyber Monday weekend. This creates a natural time for teams to revisit their non-code artifacts such as incident runbooks.

I've also been on-call quite a bit recently, and I've had to respond to some incidents where the automated alerts linked to inaccurate and non-authoritative runbooks. As part of the follow-ups for those incidents, I offered to hold a lunch-and-learn talk on effective incident runbooks. Here is the result.

## A cloneable runbook template

Everything below this division can be made into a standalone page in your organization's documentation tool of choice. The goal is to help engineers take the guesswork out of what an incident runbook should contain to be effective.

This template assumes the reader:

- Already understands the importance of incident management and how it works at your organization
- Already understands the importance of service monitoring and how to create effective automated alerts

When this tool is verbally presented to engineers, it is important to index on this phrase: **you get better at what you practice**. Engineers may feel that they aren't good at creating documentation like this (and that might be true), but they can't get good without practice. Having a template to follow like this reduces the barrier to entry.

For the call to action, have engineers that participate in an on-call rotation apply this template to their team's oldest runbooks (they tend to be the most inaccurate & unstructured).

---

> ℹ️ This page has been written toso that it can be easily copied/pasted to serve as a starting point for an incident runbook. All sections marked as a blockquote, including this introduction, are done so to be easily deletable.
>
> ⚠️ This how-to guide expresses the author's opinions, as every how-to guide does. There is not a single correct way to write an incident runbook, and not all sections apply to every runbook.
>
> ✅ This guide is based on the following teneants. An _incident_ runbook _should_ be:
>
> - An ordered list of actions to investigate, _then_ mitigate, and _then_ remediate a specific situation
> - Something that anyone can (and should) edit as systems change
> - Complete with warnings and tradeoffs, so that responders don't make the situation worse
> - Something a newly-onboarded or REM-sleep-interrupted engineer could follow, at least in part
> - A single, authoritative guide – there should be no documents that could conflict
>
> ❌ And incident runbook should _not_ be:
>
> - Written once and never reviewed for accuracy again
> - A how-to guide on how to perform regular tasks or otherwise operate a system (see "[An Effective How-To Guide Template](/blog/an-effective-how-to-guide-template)")

## Summary of the situation

> This section has one goal:
>
> - Help the incident responder quickly understand _what_ is happening (not necessarily the "why").
>
> The title & description of the automated alert that led an engineer to this runbook are likely not enough information to understand what is truly happening. Summarize the situation in one or two plain English sentences.

_Summary of the situation._

Related alerts:

- _Link(s) to automated alerts that led to this runbook_

Related metrics dashboards:

- _Link(s) to metrics dashboards that may help show a more holistic problem_

Related SLOs:

- _Link(s) to SLOs that may be at risk because of this situation_

## Triage & assessing severity

> This section has three main goals:
>
> 1. Help the incident responder discern what is happening, souch that it can be mitigated.
> 2. Help the incident responder measure the impact on external customers, in case communications need to be sent out.
> 3. Help the incident responder measure the impact on internal teams, in case this incident needs to be escalated to additional teams. This may uncover additional impact on external customers.
>
> An incident responder may know the impact on external customers before they know the root cause, and this is okay! Stakeholders should always be notified as soon as information is available.
>
> You should provide a list of metrics and dashboards to help the incident responder determine the root cause. Some effective ways to lay this out are:
>
> - If your automated alert is a multi-alert (different data tags produce different alerts) indicate how triage steps change for different tags, and if different tags have different severities. For example, tag values with the word "backup" in them may indicate a low severity, while tag values with the word "identity" in them may indicate a high severity, and escalation is needed.
> - If there are more than a few triage steps, it may make sense to include a decision tree.
>
> You should also include information on how to assess severity, this could be:
>
> - If your automated alert is a multi-alert, does the severity change depending on how many tags are alerting?
> - Does the severity change depending on how long the incident has been happening?
> - Does the severity change depending on the magnitude of some metric?
> - Does the severity change depending on the time of day, or day of the week?

Steps to take, in order:

1. _Investigation step one_
2. _Investigation step two_
3. _Investigation step three_

## Mitigating the immediate issue

> This section has two main goals:
>
> 1. Help the incident responder take steps to stop the situation from getting worse.
> 2. Help the incident responder take steps to recover from the situation.
>
> Incident mitigation is all about fixing the immediate problem. You can think of mitigation as: if I’ am paged at 3 a.m., what do I need to do to get the system healthy such that I can confidently & safely go back to sleep?
>
> Complicated, nuanced, or unclear steps may benefit from the inclusion of screenshots that have been marked up with arrows and/or numbers to indicate action order.
>
> Each root cause described in the triage section above should have a corresponding set of mitigation instructions.

Steps to take, in order:

1. _Action step one_
2. _Action step two_
3. _Action step three_

## Validating health & stability

> This section is optional, as it may be enough to say "the system is healthy when the original alert goes below its recovery threshold for (predetermined amount of time)."
>
> It may not be obvious when the incident's impact has been fully mitigated. Complicated situations that involve cascading failures or multiple teams may require many people to collectively determine if stability has been restored. Even if every automated alert has resolved itself, that may not indicate a system that is healthy and is likely to remain healthy.

Indicators that health has been restored:

- _Indicator one_
- _Indicator two_
- _Indicator three_

## Remediation & cleanup

> This section has one main goal:
>
> - Help the incident responder take any final, necessary steps before the incident can be resolved.
>
> Incident remediation covers the steps that need to be taken after mitigation, generally during normal working hours. Steps may include, but aren’ not limited to:
>
> - Reverting any temporary hotfixes made during mitigation
> - Dealing with any corrupted data or statistics
> - Auditing other services, jobs, etc. for similar risks
>
> This doesn’ not encompass incident follow-ups, which should be created & prioritized as part of the written incident postmortem & debrief meeting.

Steps to take, in order:

1. _Action step one_
2. _Action step two_
3. _Action step three_

> ## Examples
>
> Here are some example incident runbooks that teams find effective. They might not match the exact structure here, and that's okay! Please feel free to add more from your team.
>
> 1. _Link to runbook one_
> 2. _Link to runbook two_
> 3. _Link to runbook three_
<!--stackedit_data:
eyJoaXN0b3J5IjpbMzg1NTgzMzkzXX0=
-->