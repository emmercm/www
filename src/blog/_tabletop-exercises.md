
#### Goal

Rehearse how we detect, triage, diagnose, and communicate during incidents, without touching live systems, so the team can confidently handle issues/incidents related to Subscription services.

##### Outcomes

-   Surface concrete knowledge gaps (dashboards, logs, runbooks, ownership).
    
-   Produce a prioritized, owner-assigned follow-up list (docs to write, dashboards to create, etc.).
    
-   Increase confidence that the team can resolve common/critical failures independently.
    

#### Scope & Rules

-   Role-play only; no changes to prod/staging.
    
-   Use real tools for observation (dashboards, logs, alerts) but simulate all actions.
    
-   Blameless, psychological-safety environment.
    
-   Timeboxed. Decisions > perfection.
    

#### Roles

-   Facilitator: designs scenarios, releases additional info as the incident progresses, timeboxes, redirects.
    
-   SEV Commander: drives triage, delegates, makes decisions.
    
-   Responders: query dashboards/logs, form hypotheses, propose mitigations.
    

Scribe: captures timeline, hypotheses, decisions, gaps, and next steps.

#### Expectations

-   Come prepared - skim top runbooks and on-call handoff notes. Keep dashboards handy for our tier-1 services.
    
-   Cameras on by default.
    
-   Active participation - narrate your thinking, share screen when investigating.
    

#### Agenda (60 min)

-   0 - 5: Scenario brief (symptoms only).
    
-   5 - 45: Triage, investigation, and mitigation plan.
    
-   45 - 60: [Debrief](https://docs.google.com/document/d/13DJ2kZZ1wVnzYMGB4EThUZR-K3Jz1h2m7VT3nq6xkUI/edit?tab=t.0#bookmark=kix.i2pfplzhu96m), assign action items with owners and due dates.
    
-   Optional 5min break between incidents.
    

#### Rubric for Performance Evaluation

-   Detect: Did we quickly find the right signals/places to look?
    
-   Diagnose: Did we form/validate a plausible root-cause hypothesis?
    
-   Decide: Have we converged on a safe and effective mitigation path?
    
-   Execute (Simulated): Were the steps clear, ordered, and reversible?
    

#### Debrief Prompts

-   What slowed us down? (access, dashboards, unfamiliar systems)
    
-   What would we actually change now? (feature flag, revert, scale, pause jobs)
    
-   Which runbooks were missing/outdated?
    
-   Where is single-owner knowledge a risk?
    

#### Deliverables (end of session)

-   Action log (owner, due date, link):
    

-   Runbooks to create/update.
    
-   Dashboard additions.
    
-   KT sessions to schedule (topics + doc links).
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE0MTk1ODc0NTksNzMwOTk4MTE2XX0=
-->