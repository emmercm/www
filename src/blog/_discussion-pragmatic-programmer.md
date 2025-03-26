
---  
  
title: "Discussion Guide: The Pragmatic Programmer, 20th Anniversary"  
draft: true  
tags:  
- books  
- career  
  
---

A guide with discussion prompts for Tanya Reilly's [The Staff Engineer's Path](https://noidea.dog/staff).

[The Staff Engineer's Path](https://noidea.dog/staff) (2022) is one of the few books that talk about what it's like to continue growing on an individual contributor path rather than a people management path. Will Larson's [Staff Engineer](https://staffeng.com/book) is one of the others, and both have been published only in the last two years. Both books have been some of the most important ones that I've read in 2023.

I run the engineering book club at my current company, [Attentive](https://www.attentive.com/). For the pace of our book club, we committed to reading 2 chapters every 2 weeks. I personally appreciate having multiple discussions over time, I find I better retain content that way. These are the exact discussion prompts I used over the few months of reading the book, so they're colored by my personal experience and the current culture at Attentive. All prompts are wholly my own and are free to use by all.
  
## Chapter 1  
  
- (Topic 3: Software Entropy) How does your team handle "broken windows"? Is time reserved to fix them, or are they at least boarded over? Does your team generally understand the point at which a window gets broken?  
- (Topic 5: Good-Enough Software) How does your organization do with keeping short iteration cycles? Is feedback incorporated early and often?  
- (Topic 6: Your Knowledge Portfolio) Besides reading this book, how are you investing in your programming "knowledge portfolio?" Do you have recent newsletters or books you'd recommend to others?  
- (Topic 7: Communicate!) Have you struggled to gain traction on a proposal recently, with your teammates or stakeholders? Did you find any advice from this topic actionable for this or other proposals you struggled with?  
  
## Chapter 2  
  
- (Topic 8: The Essence of Good Design) Does your organization have any pervasive patterns that make code difficult to change?  
- (Topic 10: Orthogonality) Can you think of a unit test suite that takes significant work to set up? How would you describe the orthogonality of its unit under test?  
- (Topic 11: Reversibility) Have you tried to abstract the usage of some technology, or make the choice of it more reversible and found it was difficult to do so? Do you think it was a design flaw in the technology itself?  
- (Topic 12: Tracer Bullets) How are you currently using tracer bullets (or "vertical slices") in your projects? Are you finding iterating during implementation more effective than additional up-front design? How have they affected progress tracking and timeline adjustments?  
- (Topic 13: Prototypes and Post-it Notes) What's the most creative way you have prototyped a programming or non-programming project before?  
- (Topic 14: Domain Languages) Have you ever regretted abstracting some functionality into a domain-specific language (DSL)? Was the abstraction worth the effort?  
  
## Chapter 3  
  
- (Topic 16: The Power of Plain Text) What would the authors think about common binary serialization formats such as [Protocol Buffers](https://protobuf.dev/) and [Apache Avro](https://avro.apache.org/)?  
- (Topic 18: Power Editing) What is your favorite IDE shortcut, feature, or other life hack that has improved your development workflow?  
- (Topic 19: Version Control) Share your dotfiles repository with the group if you have one!  
- (Topic 19: Version Control) Have you ever worked at a place that didn't use version control, or had poor hygiene around it? What do you think about it in hindsight?  
- (Topic 20: Debugging) Do you have any stories about a bug that was particularly difficult to track down and reproduce? How did you reproduce it, fix it, and then make sure it never happened again?  
- (Topic 22: Engineering Daybooks) Do you keep something similar to an engineering daybook, physical or otherwise? What medium is it in, and do you use any digital technology for it? In what situations have you found its history of information useful?  
- What are your thoughts on the authors' opinions on using plain text for everything, CLIs over IDEs, keyboard over mouse, and version control for everything?  
  
## Chapter 4  
  
- (Topic 23: Design by Contract) Have you ever worked with a code generation tool that lets you [design by contract](https://en.wikipedia.org/wiki/Design_by_contract)? Did you use it, and how effective was it?  
- (Topic 24: Dead Programs Tell No Lies) In a web API world where exceptions can propagate to other services, how do you feel about the "crash early" tip? Where _should_ exceptions be handled?  
- (Topic 25: Assertive Programming) Does your organization use linters or pre-compiler steps to help avoid language shortcomings? Do you report issues as errors or just warnings?
  
## Chapter 5  
  
- (Topic 28: Decoupling) How often do you make a change and encounter seemingly unrelated unit tests start failing? Is this a problem with just a few packages/namespaces or services, or many of them? How would you start to address this?  
- (Topic 29: Juggling the Real World) Where could your team benefit from using finite state machines or pub/sub processing?  
- (Topic 29: Juggling the Real World) Which of the responsive patterns do you think make sense to use across domain boundaries, and which do you think don't: finite state machines, the observer/callback pattern, pub/sub, and reactive programming with streams?  
- (Topic 32: Configuration) Does your organization have one common way to configure your services, or are there multiple different options? If there are multiple different options, what is your opinion of them?
  
## Chapter 6  
  
- (Topic 34: Shared State Is Incorrect State) Have you had to deal with or debug concurrency issues within a service? Between replicas of the same service? Between different services entirely?  
- (Topic 35: Actors and Processes) Where do you think your organization could apply the actor pattern?  
  
## Chapter 7  
  
- (Topic 37: Listen to Your Lizard Brain) Do you make use of code prototypes regularly? Or do you find yourself getting attached to code you've written? Share a story about a time you wish, in hindsight, that you had thrown away your first draft.  
- (Topic 38: Programming by Coincidence) Have you encountered a comment from a past developer to the effect of "don't change this or everything will break, and I don't know why"? Do you think that piece of code suffered from too much coincidence?  
- (Topic 39: Algorithm Speed) Have you ever used leetcode skills such as algorithm design and optimization in a job? What were the project(s)?  
- (Topic 40: Refactoring) In most organizations, securing time dedicated to only refactoring or paying down tech debt is difficult. What tips and tricks do you have for working it into your daily work?  
- (Topic 41: Test to Code) Do you regularly practice test-drive development (TDD)? Are there certain times you favor it or certain times you avoid it?  
  - Do you agree with the authors' opinions that TDD is particularly useful for newer developers, but that TDD can cause some shortsightedness?  
- (Topic 42: Property-Based Testing) A lot of people would argue that automated tests should be deterministic and not use randomized values. How do you feel about the example usage of [Hypothesis](https://hypothesis.readthedocs.io/en/latest/), even when used with other, static tests?  
- (Topic 44: Naming Things) What is your opinion on the tradition of "obscure, 'clever' names" for microservices?  
  
## Chapter 8  
  
- (Topic 45: The Requirements Pit) Have you ever taken the advice of sitting with a user of your software for an extended period? Was it an effective use of your time? What did you learn from that experience?  
- (Topic 46: Solving Impossible Puzzles) What is your favorite or most effective distraction to take when you're struggling to solve a problem?  
- (Topic 47: Working Together) Have you ever worked at a company that had a strong culture of pair or mob programming? What was your experience? What aspects of it would you like to use again?  
- (Topic 48: The Essence of Agility) What's the best example of an Agile culture that you've seen before? What made it better than other organizations?  
  
## Chapter 9  
  
- (Topic 49: Pragmatic Teams) What team norms do you currently have that are generally well received and you find effective? Any new norms you wish your team would adopt?  
- (Topic 50: Coconuts Don't Cut It) What do you think your current team, organization, or company is cargo culting from other companies? Is it working for you?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTIxNjE4MjA0NSwtMzM3NjI4MjMzXX0=
-->