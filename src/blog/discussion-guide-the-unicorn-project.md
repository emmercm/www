---

title: "Discussion Guide: The Unicorn Project"
date: 2023-11-05T22:32:00
tags:
- books
- career

---

A guide with discussion prompts for Gene Kim's [The Unicorn Project](https://itrevolution.com/product/the-unicorn-project/).

[The Unicorn Project](https://itrevolution.com/product/the-unicorn-project/) (2019) is a follow-up to 2013's [The Phoenix Project](https://itrevolution.com/product/the-phoenix-project/). Both books are about the same company, Parts Unlimited, a company that can't get out of its own way to make a digital transformation from brick and mortar stores to e-commerce. Phoenix tells a story from the perspective of a manager and people leader, and Unicorn tells a story from the perspective of a very senior individual contributor.

I run the engineering book club at my current company, [Attentive](https://www.attentive.com/). Most attendees are non-staff+ individual contributors, so between Gene Kim's two books, The Unicorn Project spoke more to our personal experiences. For the pace of our book club, we committed to reading 3 chapters every 2 weeks. I personally appreciate having multiple discussions over time, I find I better retain content that way. These are the exact discussion prompts I used over the few months of reading the book, so they're colored by my personal experience and the current culture at Attentive.

_Some of the discussion questions here come directly from the [official reader's guide](https://itrevolution.com/product/readers-guide-the-unicorn-project/), which is free to download. These questions are called out, and any alterations are denoted with square brackets._

## Prologue & chapter 1-2

- **Reader's guide:** Are there any similarities between Maxine's new working conditions and the working conditions at your organization?
- The Phoenix documentation team's onboarding is woefully insufficient. What was your experience when joining your organization? How have you contributed to your team's onboarding process or documentation?
- **Reader's guide:** What are your thoughts about Parts Unlimited requiring Maxine and the Phoenix developers to record what they did each day on their timecards?
- **Reader's guide:** Has your organization ever been in "wartime"? Why? How did "wartime" eventually end?
- "Don't rock the boat" is mentioned several times. What might this be foreshadowing? Does Chris know something that we don't?
- Does anyone else think Maxine should quit immediately and get a new job?
- The author includes a story where the CEO describes a safety incident with crushed fingers. It felt out of place. Is this just a random detail, or did the author include this for a specific reason?

## Chapters 3-5

- **Reader's guide:** When you encounter a roadblock that prevents you from doing your work, who do you go to? How long does it normally take for the issue to be resolved?

  - Do you have a specific example from recent memory?
  - Do you have a strategy that has helped you before?

- **Reader's guide:** How do you determine when a product is ready to be deployed?
- **Reader's guide:** Do you ever feel like you need to break rules to make progress on something?
- **Reader's guide:** Think back to the most recent production deployment you participated in. What went well? What could have gone better? What can you personally do to implement more effective processes?
- Maxine thinks Kurt is shady. What do you think Kurt's ulterior motive is?
- Have you and/or your team been able to replicate an in-person happy hour effectively? Do you have any regular 1:1s with people outside your team?
- Have you worked at an organization where completed work is handed off to other teams for QA & release? What was your experience with that?

## Chapters 6-8

- The Phoenix Project's release goes so poorly that engineers barely sleep and most catch a cold from being overworked. Have you ever been part of an incident so severe that sleep shifts become a serious topic of discussion?
- **Reader's guide:** How much technical debt does your [team] have?

  - How does your team pay down this debt? Do you have any specific processes?

- **Reader's guide:** How do you get fast and continual feedback on your work?

  - When in the middle of project execution, how often do you deploy? What is your ideal pull request size?

- What is the oldest code you know of that your organization is still running in production? Has it evolved to keep up with ever-changing engineering best practices? How many engineers know enough about it to maintain it?

## Chapters 9-11

- All teams at Parts Unlimited are hamstrung by a lack of higher environments for testing, and the Data Hub team is no exception. How often are you unable to test your changes locally, or are blocked from testing them in a higher environment? What is causing these blocks?
- **Reader's guide**: How often do teams mingle and get to know each other? What can you do to encourage cross-team camaraderie?
- The biweekly code merge team has 392 dev tickets worth of code to merge, creating a monstrous conflict nightmare. If teams were free & safe to merge their own code, it's likely the conflicts would have been prevented. What are your opinions on code freezes that try to ensure production stability?
- **Reader's guide:** What is your [team]'s ticketing process? How many tickets are open at your [team] at any given time?

  - **Reader's guide:** How old is the oldest ticket? How do you delete tickets?

- The Data Hub team is prevented from deploying their own code to production. To change this, they would need to submit a Technology Evaluation Process (TEP) form to the Lead Architecture Review Board (LARB). Are there processes that get in the way of you innovating and/or delivering customer value? Have you had poor experiences with architecture boards?

## Chapters 12-14

- **Reader's guide:** How often does your organization take on new programs or otherwise experiment?
- As an individual contributor, it is somewhat common to have a poor experience with a gate-keeping architecture review committee (e.g. the LARB). What _positive_ experiences have you had? What type of committee would be helpful to you?
- **Reader's guide:** What's stopping your teams from acting independently?
- **Reader's guide:** What is your organization's overall attitude toward blame? If someone specific is at fault, how does the organization treat that person?
- The Rebellion, Unicorn team, and others spend a _significant_ amount of personal energy and time to ensure Parts Unlimited succeeds. What do you think about this? Is this personal flow & joy from the second ideal, or personal sacrifice?
- The Unicorn (and Orca, Narwhal, Panther, etc.) project/team makes large, risky bets just weeks before the company's largest day of the year. What do you think about this? Would this type of initiative have a chance of succeeding in your organization?
- **Reader's guide:** Does your organization use a unified vocabulary and taxonomy? How can you be sure that you're all talking about the same things?
- **Reader's guide:** When was the last time you told someone that they did a good job?

## Chapters 15-17

- Does your team have an effective load testing strategy that actually simulates real user traffic? What does it look like, and what technologies are used?
- **Reader's guide:** In your opinion, what is the single most important thing that contributed to the [Parts Unlimited] Black Friday promotion's success?
- **Reader's guide:** Does your organization have any Horizon 2 or Horizon 3 projects? If not, brainstorm potential Horizon 2 and Horizon 3 projects.
- **Reader's guide:** Does your organization value core [competencies] over context or vice versa? What would it take for your organization to prioritize core (if they don't already)?
- **Reader's guide:** Of the applications and services managed by your organization... which ones truly advance competitive advantage? And which can you rely on vendors for?
- What Parts Unlimited products do you think they can outsource? For example, is the "Unikitty" custom CI product worth developing and maintaining?
- What do you think about engineering managers abandoning CI because of the "Unikitty" outages? How would you convince these managers of the value of CI?
- Do you think Maxine, Kurt, and others should just abandon ship? It is clear that Sarah intends to sink this company, and fighting her will take a Herculean effort.

## Chapters 18-19 & epilogue

- **Reader's guide:** Does your [team] hold [postmortems](https://en.wikipedia.org/wiki/Postmortem_documentation) after successful launches? What are (or would be) the most valuable insights a postmortem for a successful launch would provide?
- Does your team hold [pre-mortem](https://en.wikipedia.org/wiki/Pre-mortem) tabletop sessions before launches? How much time is spent on imaging what _could_ go wrong?
- The Unicorn teams open up postmortem meeting attendance to anyone who is interested, and they frequently gather quite a crowd, especially the one for pre-Christmas promotions. Do you agree or disagree with making the meeting public? Is this something you would like to try, or what would hold you back from trying?
- Steve mandates Teaching Thursdays across the whole company, bringing back an old tradition of investing in employees. Does your team or organization hold regular teaching & learning sessions? What topics would you hope to see covered at sessions like these?
- **Reader's guide:** Take a look at the Distinguished Engineer job listing on page 334. Do you have a position like it at your organization? If you don't, who in your organization would be a good fit for the position?
