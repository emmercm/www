---

title: Who Is Your Audience and What Do They Do?
date: 2026-08-27T03:28:00
image: https://unsplash.com/photos/a-person-sitting-at-a-desk-with-a-laptop-and-headphones--XXG_cjF2zU
tags:
- writing

---

Having a clear goal will increase the effectiveness of your technical writing.

I've found myself giving this advice to fellow software engineers at work recently:

> When writing a document that intends to communicate an idea or drive some action, you need to answer three questions before writing anything:
>
> 1. Who is my audience?
> 2. What do I want from them?
> 3. What do they care about?

Technical writing can be intimidating when you have little or infrequent practice. I believe that answering these questions helps to define the goal of writing, which should hopefully make the task more approachable.

I'll give some concrete examples of how I answer the questions.

## Problem statements

When I identify a systemic problem that I believe is worth addressing, I like to use a lightweight ("one-pager") document to succinctly describe the problem, the severity, and a hypothesis for the solution with a rough estimate. If making a decision about next steps requires a meeting, it's especially helpful to have a short document for participants to read ahead of time.

Here's how I'd answer the three questions:

1. **Who is my audience?** My manager, product manager, or whoever has control over getting the project funded and scheduled on a roadmap.
2. **What do I want from them?** I want them to be convinced that the problem I have identified is worth solving, and it is worth solving soon.
3. **What do they care about?** They care about the value that would be added, the money that would be saved, or the risk that would be mitigated. They need enough information to make a decision on if this project is more or less important than another.

## Product requirements documents

A product requirements document (PRD), product spec, functional requirements document (FRD), or any other document that conveys project goals and requirements should also answer the three questions.

1. **Who is my audience?** The people who will be executing the project or implementing the feature.
2. **What do I want from them?** I want them to execute the project accurately, achieving all of its goals.
3. **What do they care about?** The project executors care about being provided the "what" and the "why," such that they can determine the "how."

## Technical design documents

As a software engineer, this is what I write the most of. Technical design documents, tech specs, RFCs, or any other document that conveys an implementation plan has a very different audience from the other examples.

1. **Who is my audience?** There are two:
   1. Whoever needs to review and approve the plan. This might be your teammates and counterparts from other teams, or it might be an architecture review board.
   2. Whoever needs to execute the plan, probably your teammates.
2. **What do I want from them?** Two answers for the two audiences:
   1. I want reviewers to be convinced that I have chosen the best approach given the project constraints.
   2. I want implementers to understand the plan such that they can execute it accurately.
3. **What do they care about?** Again, two answers for the two audiences:
   1. Reviewers care that I have compared all feasible solutions, have mitigated all risks, and documented all tradeoffs and consequences.
   2. Implementers care about having clarity about each task and how they all fit together.

## How-to guides

I wrote a [template for how-to guides](/blog/an-effective-how-to-guide-template) designed to be easily copy-and-paste-able, and it helps walk you through answering the three questions:

1. **Who is my audience?** It might be your teammates, it might explicitly be people _not_ on your team, or it might be people with a completely different job function. You will need to know who will be responsible for executing the work that you're describing.
2. **What do I want from them?** Most of the time I just want them to not bother me with questions that a document could answer.
3. **What do they care about?** They care about being provided accurate and succinct information that helps them achieve their desired outcome.

## Conclusion

The three questions can be applied to any written document you write, and answering them helps you stay focused on the document's goal. Give it a try on the next thing you write!
