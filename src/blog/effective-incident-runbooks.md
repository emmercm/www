---

title: effective incident runbooks
date: 2023-11-02

---

> ℹ️ This page has been written so that it can be easily copied/pasted
> to serve as a starting point for an incident runbook. All sections
> marked as a “note,” including this introduction, are done to be easily
> deletable.
> 
> ⚠️ This how-to guide expresses the author’s opinions, as every how-to
> guide does. There is not a single correct way to write a runbook, and
> not all sections apply to every runbook.
> 
> ✅ This guide is based on the following tenants. An _incident_ runbook
> _should_ be:
> 
> -   An ordered list of actions to assess severity, _then_ mitigate, and _then_ remediate    
> -   Something that anyone can (and should) edit as systems change
> -   Complete with warnings and tradeoffs, so that responders don’t make the situation worse
> -   Something a newly-onboarded or REM-sleep-interrupted engineer could follow, at least in part
> -   A single, authoritative guide – there should be no documents that could conflict
> 
> ❌ And incident runbook should _not_ be:
> 
> -   Written once and never reviewed for accuracy again
> -   A how-to guide on how to perform regular tasks or otherwise operate a system

    

# Summary of the situation

> This section has one goal:
> 
> -   Help the incident responder quickly understand _what_ is happening (not necessarily the “why”)
>     
> 
> The title & description of the monitor that led an engineer to this
> runbook are likely not enough information to understand what is truly
> happening. Summarize the situation in one or two plain English
> sentences.

_Summary of the situation._

Related monitors:

-   _Link(s) to Datadog monitors that led to this runbook_
    

Related dashboards:

-   _Link(s) to Datadog dashboards that may help show a more holistic problem_
    

Related SLOs:

-   _Link(s) to Datadog SLOs that may be at risk because of this situation_
    

# Triage & assessing severity

> This section has three main goals:
> 
> 1.  Help the incident responder discern what is happening, such that it can be mitigated.
>     
> 2.  Help the incident responder measure the impact on external customers, in case communications need to be sent out.
>     
> 3.  Help the incident responder measure the impact to internal teams, in case this incident needs to be escalated to additional teams. This
> may uncover additional impact on external customers.
>     
> 
> An incident responder may know the impact on external customers before
> they know the root cause, and this is okay, as long as stakeholders
> are notified of this information.
> 
> You should provide a list of metrics and dashboards to help the
> incident responder determine the root cause. Some effective ways to
> lay this out are:
> 
> -   If your monitor is multi-alert (stats are aggregated by some tag(s)) indicate how triage steps change for different tag(s), and if
> different tag(s) have different severities. For example, tag values
> with the word “backup” in them may indicate a low severity, while tag
> values with the word “enricher” in them may indicate a high severity,
> and escalation is needed.
>     
> -   If there are more than a few triage steps, it may make sense to include a decision tree.
>     
> 
> You should also include information on how to assess severity, this
> could be:
> 
> -   If your monitor is multi-alert, does the severity change depending on how many tags are alerting?
>     
> -   Does the severity change depending on how long the incident has been happening?
>     
> -   Does the severity change depending on the magnitude of some metric?
>     
> -   Does the severity change depending on the time of day or day of the week?

    

Steps to take, in order:

1.  _Investigation step one_
    
2.  _Investigation step two_
    
3.  _Investigation step three_
    

# Mitigating the immediate issue

> This section has two main goals:
> 
> 1.  Help the incident responder take steps to stop the situation from getting worse.
>     
> 2.  Help the incident responder take steps to recover from the situation.
>     
> 
> Incident mitigation is all about fixing the immediate problem. You can
> think of mitigation as: if I am paged at 3 a.m., what do I need to do
> to get the system healthy such that I can safely go back to sleep?
> 
> Complicated, nuanced, or unclear steps may benefit from the inclusion
> of screenshots that have been marked up with arrows and/or step
> numbers.
> 
> Each root cause described in the triage section above should have a
> corresponding set of mitigation instructions.

Steps to take, in order:

1.  _Action step one_
    
2.  _Action step two_
    
3.  _Action step three_
    

# Validating health & stability

> This section is optional, as it may be enough to say “The system is
> healthy when the original alert goes below its recovery threshold for
> (predetermined amount of time).”
> 
> It may not be obvious when the incident’s impact has been fully
> mitigated. Complicated situations that involve cascading failures or
> multiple teams may require many people to collectively determine if
> stability has been restored. Even if every automated alert has
> resolved itself, that may not indicate a system that is healthy and is
> likely to stay healthy.

Indicators that health has been restored:

-   _Indicator one_
    
-   _Indicator two_
    
-   _Indicator three_
    

# Remediation & cleanup

> This section has one main goal:
> 
> -   Help the incident responder take final, necessary steps before the incident can be resolved.
>     
> 
> Incident remediation covers the steps that need to be taken after
> mitigation, generally during normal working hours. Steps may include,
> but are not limited to:
> 
> -   Reverting any temporary hotfixes made during mitigation
>     
> -   Auditing other services, jobs, etc. for similar risks
>     
> 
> This does not encompass incident follow-ups, which should be created &
> prioritized as part of the incident post-mortem & debrief.

Steps to take, in order:

1.  _Action step one_
    
2.  _Action step two_
    
3.  _Action step three_
