---

title: ok

---

People practice fire and tornado drills so they know how to respond to emergencies. You can do the same with software systems your team owns.

# Introduction

A tabletop exercise works like this:

-   One engineer is assigned to be the scenario facilitator (the “Dungeon Master”)
    
-   One engineer is assigned to be the primary on-call (the incident commander)
    
-   One or more engineers are assigned to be the secondary on-call
    

The facilitator comes prepared with a failure scenario and verbally presents it to the on-call engineers as if they were being notified of a real problem. The facilitator then pretends to be your observability tool(s), answering diagnosis questions that the on-call engineers have.

The on-call engineers are then responsible for the full incident lifecycle: severity assessment, mitigation, and remediation. They should interact with your real incident management tools as much as possible.

There are multiple goals of these exercises:

-   The on-call engineers get practice managing an incident, including the specifics of your tool(s) and escalation policies.
    
-   The on-call engineers get practice with the system that had a fictional fault, spreading knowledge across the team.
    
-   The facilitator gets practice in leadership, communication, and failure prediction.
    
-   Everybody learns where there are gaps in automated alerts and other observability tools that could have made diagnosis faster.
    
-   Everybody learns where there are gaps in incident runbooks that could have made diagnosis or mitigation faster.
    

# Behavior expectations

-   **The facilitator comes prepared.** The effectiveness of the exercise depends largely on the facilitator’s ability to think the entire scenario through, including what second- and third-order effects the failure might have.
    
-   **The on-call engineers take the exercise seriously.** The goal of the exercise is to test real job expectations: expertise in the systems you operate, the ability to exercise your company’s incident response plan, and effective communication.
    
-   **The on-call engineers must all participate.** Practice with simulated failures allows people to respond more calmly, confidently, and clearly during a real failure.
    

# Ground rules

-   **No changes to production systems.** This is not chaos engineering; at no point should any exercise threaten the health of production systems. This includes both the scenario setup by the facilitator and mitigating actions taken by the on-call engineers.
    
-   **The primary on-call shares their screen.** This is especially necessary with a remote team. The on-call engineers should treat this as a pairing session, and observers should pay attention to tools and tricks they haven’t seen or used before.
    
-   **No one drowns.** Having multiple engineers on-call means no one struggles alone. The point is to practice real-world skills in a safe environment, not to evaluate the on-call’s performance.
    
-   **There are no dumb questions.** These exercises are a safe space to address gaps in understanding without the fear of judgement.
    
-   **Observers stay mostly silent.** You should practice multiple scenarios, giving each engineer a chance to be on-call. Observers should stay as silent as they can to allow the on-call engineers space to practice.
    

# Facilitator pre-work

Facilitators are responsible for coming up with failure scenarios for their teammates to respond to. This can require a lot of pre-work to think through second- and third-order effects far enough to know how the failure might trigger alert(s). This requires expertise in the hypothetically failing system, so it makes sense for the team’s resident expert to facilitate, treating the exercise as a teaching opportunity.

There are two different strategies for identifying a candidate scenario:

-   Bottom-up: start with a failure mode, and then think through what alert(s) it would trigger. This is likely the easier option.
    
-   Top-down: start with an alert, and then think through what failure modes might trigger it. This could help practice alerts that frequently trigger but can have different causes.
    

Tips:

-   Past incidents make for good scenarios, especially if they have happened multiple times. Avoid picking recent incidents that are still in the team’s short-term memory; the root cause should not be immediately obvious.
    
-   Scenarios should be realistic. Failure modes such as a complete regional outage might be fun to discuss, but you’re better off picking more likely scenarios to practice first.
    

# How to facilitate

During the exercise, the facilitator presents the scenario to the on-call engineers in terms of an alert that has been triggered or a support ticket that has been submitted. If the alert would automatically create an incident, then the facilitator should create a test incident.

The facilitator should provide minimal information up-front; it is the job of the on-call engineers to ask follow-up questions.

The facilitator’s job is to be a stand-in for observability tools available and people outside of your team. Some examples:

-   Your alert system (which may require the facilitator to convey if more alerts start triggering as the failure progresses).
    
-   Runtime observability tools including application performance monitoring, logs, and metrics.
    
-   The hypothetical on-call engineer(s) for other teams besides your own. These engineers might help answer questions that your on-call engineers are asking, or they may alert your on-call engineers of observations in their systems.
    
-   Stakeholders, including your leadership chain. The on-call engineers may need to ask for permission before simulating a mitigating action.
    

The facilitator should provide as direct an answer to questions as they can. Responding with more information than necessary can unintentionally give away the root cause, robbing the on-call engineers of practice.

The exercise is done when the on-call engineers diagnose the problem and simulate mitigating action(s). Depending on the scenario, the engineers may also need to simulate or communicate what remediating actions should be taken.

# How to be on-call

The on-call engineers are responsible for:

-   Diagnosing the problem by conversing with the facilitator.
    
-   Mitigating the problem by simulating an action.
    
-   Practicing your company’s incident response plan.
    
-   Practicing communication with stakeholders.
    

On-call engineers have to ask questions of the facilitator about metric values & trends, service logs, and other health signals. This may feel awkward at first, but if everyone takes it seriously, it will become less so. Having the primary on-call share their screen helps with communication, they can use their mouse pointer to indicate what metric they want to know more information about from the facilitator.

Some questions you might ask:

-   How large is the message backlog? How quickly is it growing, and is it accelerating?
    
-   How high is the CPU usage? Is it increasing or decreasing over time? Is it evenly distributed, or are some instances noticeably higher or lower?
    

(one, some, many)

# How to be an observer

The rest of the team should take notes to suggest artifact and process improvements. Even though observers should remain silent during the exercise, they should participate in the debrief at the end.

# Debriefing

At the end, everyone on the team (facilitator, on-call engineers, and observers) should hold a mini incident postmortem, discussing:

-   What went well: what alerts, incident runbooks, and service dashboards were effective.
    
-   What didn’t go well: what slowed down diagnosis or remediation (missing observability, noisy signals, out-of-date or missing runbooks, etc.).
    
-   Where you got lucky: what went well but probably shouldn’t have.
    

The goal is to bring down mean-time-to-detection (MTTD) and mean-time-to-recovery (MTTR) by ensuring everyone has the alerts, runbooks, knowledge, and confidence to respond to a similar failure in the future.

# Additional reading

-   The [Google SRE book](https://sre.google/sre-book/accelerating-sre-on-call/) calls these exercises “wheel of misfortune.”
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExOTcxNzUzODBdfQ==
-->