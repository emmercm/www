---

title: An Effective How-To Guide Template
date: 2024-12-09T00:00:00
tags:
- career

---

Having a template when writing technical how-to guides can increase clarity and therefore usability.

In this article I'm defining "technical how-to guides" as a list of repeatable steps an engineer may need to execute during their daily work.

Some examples of how-to guides I use at work on a weekly or monthly basis:

- How to create & deploy a new [microservice](/blog/tag/microservices)
- How to escalate a support ticket with a vendor

## A cloneable how-to guide template

Everything below this division can be made into a standalone page in your organization's documentation tool of choice. The goal is to help engineers take the guesswork out of what a how-to guide should contain to be effective.

When this tool is verbally presented to engineers, it is important to index on this phrase: **you get better at what you practice**. Engineers may feel that they aren't good at creating documentation like this (and that might be true), but they can't get good without practice. Having a template to follow like this reduces the barrier to entry.

---

> ℹ️ This page has been written so that it can be easily copied/pasted to serve as a starting point for an incident runbook. All sections marked as a “note,” including this introduction, are done to be easily deletable.
>
> ⚠️ This how-to guide expresses the author’s opinions, as every how-to guide does. There is not a single correct way to write a how-to guide, and not all sections apply to every how-to guide.
>
> ✅ This guide is based on the following tenets. A how-to guide _should_ be:
>
> -   An ordered list of actions to complete a specific, repeatable task
> -   Specific - the guide should cover as small of an action as is still useful, and then related how-to guides should be cross-linked together
> -   A single, authoritative guide – there should be no documents that could conflict 
>
> ❌ An how-to guide should _not_ be:
>
> -   Written once and never reviewed for accuracy again
> -   An incident runbook on how to resolve a severe issue (see "[An Effective Incident Runbook Template](/blog/an-effective-incident-runbook-template)"). But how-to guides may be linked to from incident runbooks.
> 
> When staring a brand new document, here are some questions you need to
> consider:
> 
> **What is the audience for this document?**
> 
> Here are some situations that have very different audiences and
> therefore will likely have very different content:
> 
> -   I’m an IC writing an “internal” how-to guide only for my teammates (for new functionality I wrote, to prevent information loss, to amortize the cost of learning, etc.)
> -   I’m an IC on a platform team writing an “external” how-to guide for colleagues outside of my organization
> -   I’m an IC on a feature team writing an “external” how-to guide for PMs, CSMs, TAMs, and others outside of my organization that have different skill sets or responsibilities
> 
> **What does my audience already know about this topic? What might they not?**
> 
> If you’re writing for an audience outside of your team, they will have very different context from you. They may not know the same domain or technical terminology as you, the same technologies as you, or have the same product understanding as you. You should link to all relevant pre-reading at the top of the page, and all relevant next step documents at the bottom of the page.
> 
> This guide helps set a consistent structure for your team so that
> starting from scratch and modifying existing pages is as painless as
> possible.
> 
> **Here are some rules of thumb for a first draft:**
> 
> -   Limit the number of initial authors to 1-2. Having many authors of one draft may reduce the clarity of the content. Alternatively, you
> could have one person write the outline and then divide the work to
> fill in each section.
>     
> -   Have fellow subject matter experts review the document for accuracy. Written documentation is usually assumed to be correct, so
> having someone review it can save future readers from headaches.
>     
> -   Have multiple members from the guide’s intended audience review for clarity. Again, they likely have a different context from you, so they will be the best judge on if the document makes sense.
>     
> 
> **Here are some tips for keeping the document up-to-date:**
> 
> -   Act like an owner - if you come across how-to guides that you know are inaccurate, update it and make it better for the next person! If you don’t feel comfortable updating the document, ask questions of subject matter experts until you do feel comfortable updating it.
> -   Consider building documentation review into your team cadences. Every quarter or so (it doesn’t have to be often, how-to guides don’t grow stale _that_ fast), sit down with your team and review the state of your internal and external guides. Some questions to ask:
>     
>     -   Is the guide still accurate? Is there a newer or better process?
>     -   For internal guides, is the information clear to new hires on your team?
>     -   For external guides, how discoverable are they? How often do they get used vs. how often do colleagues reach out to your team over Slack?

## Overview

_Summary of what this how-to guide helps a person accomplish. Feel free to keep this short._

_Optional note of who this how-to guide is for, in case it isn’t clear from the page title or how the page is organized._

_Summary of how a person would know if this how-to guide is appropriate for their situation, ideally including keywords to make this page more discoverable. For example, it can help to include specific technology names, technical resource names, or log lines._

_Optional note of what team owns the guide and who a reader can reach out to if they experience issues, in case this isn’t clear from the content of the guide or how the page is organized._

## Pre-reading & prerequisites

_Optional section: list of documents a person may need to read to gain sufficient context before executing this how-to guide. This could involve an overview of technologies mentioned, or architecture diagrams of distributed systems._

_Optional section: summary of any setup work required before a person can execute this how-to guide. Setup could involve obtaining AWS/DB/SSH access, installing tools, or setting up a local environment._

## Steps

> These sections should be tailored to your specific use case. There is
> unlikely a one-size-fits-all solution here.
> 
> **Splitting up steps:** it may make sense to break up this section into multiple headings. For example, it may make sense to colocate all
> steps of creating, editing, and deleting a resource all on one page
> due to similar setup instructions and to ease jumping between pages.
> In that example, it would make sense to create separate headings that
> can be deep linked to separately.
> 
> **Be specific:** the less guesswork a reader has to do the better. This may mean including links to specific lines of code, AWS
> resources, Jenkins jobs, Datadog monitors, or including screenshots
> with annotations. If a step might be useful to multiple how-to guides,
> consider breaking it out into its own page and linking to it.
> 
> **Include examples:** including specific examples of actions can help the reader understand the instructions more clearly. For example, if a
> step is to execute a CLI command, execute a SQL query, or make an RPC
> call, then include an example with fields filled out with dummy data.
> 
> **Include validation steps:** if applicable, include information about how a person can know if a step completed successfully without error.
> 
> **Be clear about ownership:** if a step is not self-service and requires action from an owning team, be clear about that and include
> instructions of how to appropriately contact them.

## Next steps

_Optional section: how-to guides and/or tasks that a person would commonly need to take next._
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTQ4MDgyNTY5XX0=
-->