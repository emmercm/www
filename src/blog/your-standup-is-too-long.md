---

title: Your Standup is Too Long
image: https://unsplash.com/photos/wxWulfjN-G0
date: 2022-08-07T15:44:00
tags:
- agile
- opinion

---

The Agile Alliance recommends 15 minutes every day, I would recommend even shorter and less often.

## What is a standup?

From the Agile Alliance's [glossary](https://www.agilealliance.org/glossary/daily-meeting/):

> Each day at the same time, the team meets so as to bring everyone up to date on the information that is vital for coordination: each team members briefly describes any "completed" contributions and any obstacles that stand in their way.

The goal is to have a set time on some cadence to share information and build cohesion among team members. Standups are meant to help all team members stay aligned and productive on the most important tasks to accomplish the team's current goals.

_(Though I disagree with the rigid format that every team member must speak on every prompt every standup.)_

> This meeting is normally timeboxed to a maximum duration of 15 minutes, though this may need adjusting for larger teams. To keep the meeting short, any topic that starts a discussion is cut short, added to a “parking lot” list, and discussed in greater depth after the meeting, between the people affected by the issue.

The discussion topics during a standup need to be relevant to the gross majority of the team, or they're saved until the end when smaller groups can break off and discuss. This ensures that it's a good use of everyone's time.

## The problems

We're going to assume a few points about the average team:

- The team is long-lived with people allocation relatively stable
- The team is working on multiple projects at the same time, with at least some team members on disparate projects

Given that, the Agile Alliance's [glossary](https://www.agilealliance.org/glossary/daily-meeting/) calls out four common problems, with my commentary added:

- **The meeting devolves into status-giving/gathering meeting.**

  This culture usually comes from the scrum leader. Most of the time this information can be learned from a ticket-tracking system, so asking contributors to provide status is duplicative.

  Requiring every team member to provide a status update every day, or even every other day, conveys a sense of micromanagement and therefore distrust. Team members must provide meaningful updates every day, otherwise they risk being seen as unproductive. Even if the status update is in reality the same (e.g. "still working on \[complicated\] task X"), team members may feel the need to go into deeper details to look productive.

  Gathering status every day also leads us to the next point...

- **The meeting lasts too long.**

  This can happen when people share updates that are not important to the rest of the team. Assuming we've eliminated status-giving that is likely not relevant to the entire team, the information left to convey is learnings, opportunities, and impediments. Some examples

  > I fixed a bug yesterday that might have additional remediation, we're not sure yet. It would be a good idea for everyone to be aware of what happened.

  > I'm going to work on \[some task\] today \[that I'm a subject-matter expert on\], it would be a good opportunity for pairing if anyone is interested.

  > I rewrote our runbook on \[some class of problem\], I would appreciate people providing feedback and checking me for accuracy.

  > It took me a long time to complete some mandated training, everyone might want to budget more time than expected.

  Teams that have many projects with as few as 1 person on each can run into this problem of irrelevant discussions. As can multidisciplinary teams such as one with back-end, front-end, and designers.

- **People are lukewarm about the meeting and "forget" to have it.**

  Participants are not getting enough value out of the meeting, or don't understand the value it is providing for the team as a whole. It's probably because one of the above reasons.

- **Depending on your company's culture, it can be difficult to share impediments.**

  This tells me team members already lack psychological safety in their job, so requiring team members to speak on their work every day in a group setting is likely eroding it further.

  If team members lack psychological safety, it may lead to providing personal updates such as "I need to pick up my parents from the airport, I will be out for an hour today." Unless this impacts meetings they have with others, it's not an important update. I strongly believe that if we treat employees like adults then we will get adult behavior out of them - they will make the right decisions for them to get their work done.

Some other reasons could be:

- **The team lacks a set of clear sprint goals.**

  Having clear sprint goals helps set clear expectations for team members and provides easy discussion topics. Topics can wander if team goals are allowed to change daily. If most people are working towards the same goals then the discussion should stay relevant to everyone, but if most people have different goals...

- **The team is too large or working on too many disparate projects.**

  I believe strongly that people produce their best work when they're collaborating with others, so this is an organizational problem smell to me. If the team is too large, the organization is likely facing a management hiring problem. If the team is working on too many projects, the team or organization is likely unrealistic about the workload it can support.

- **The team "walks the board" for their standup.**

  Even worse than having each person provide a verbal update on their status, the entire team watches the standup facilitator examine the task-tracking Kanban board. It is unlikely that every task is relevant to every team member, and it is unlikely that every task should be treated with the same importance daily. The one benefit of this strategy is it keeps the standup discussion focused, but it will still surely lead to the standup lasting "too long" (above).

- **The team is spread across too many timezones, making scheduling hard.**

  This is the main reason I think mixed near and far-shore teams will never work. Teams need significant overlap in working hours to be able to collaborate in real-time in order to be their most successful. But if this is your reality, asynchronous updates should be your strategy.

- **Standup is dedicated social bonding time for the team.**

  I feel more connected to my team and my company when I build social connections with my peers, and I'm sure I'm not alone. Call me a pedant, but this isn't a standup, so call it something different. Standups are required meetings for information sharing, social meetings are optional hangouts. Using the right words helps set clear expectations.

## The monetary cost

[U.S. News](https://money.usnews.com/careers/best-jobs/software-developer/salary) says the median developer salary in 2020 was $110,140. If we say a salaried person gets paid 40 hours a week, 52 weeks a year, that works out to a wage of $52.95/hour.

If we say a team has 8 people, the cost of everyone on the team all attending a meeting is $423.60/hour.

If we say a team holds standup for 30 minutes every day, 5 days a week, the total cost of standup is $1,059/week.

The question I want you to think on is: are you getting more than $1,000 worth of value out of your synchronous standups every week?

_(Realistically the time and therefore cost will be higher because every meeting is a distraction from deep work that requires expensive context switching.)_

## Alternatives

I would suggest trying a few different strategies to see what works for the team:

- **Asynchronous standups over instant messenger.**

  Set a time deadline for the update, and set an expectation that everyone must participate. This helps team members give updates when it is the least disruptive to them.

- **Not talking about daily tasks or accomplishments at all.**

  If I want to know a contributor's status on a task, I will check our task-tracking software. Try re-shaping your standup topics to be what I mentioned above, sharing: learnings, opportunities, and impediments.

- **Fewer synchronous standups (e.g. every other day).**

  If we've eliminated status-giving as a topic, there might not be enough new information that needs to be shared out every day to warrant a meeting. Try reducing your meeting frequency, and if there is important information to share out then share it asynchronously.

I'm not saying we should eliminate standups entirely, but the gross majority of meetings need to be valuable to the gross majority of team members.
