---

title: Glue Work Is Now the Work
date: 2026-05-07T21:32:00
tags:
- ai
- opinion

---

Technical writing was always important, and now it's even more so.

Context management is one of the most important aspects of working with coding agents. The context window has to fit personal & repository rules, the session history of prompts & responses, and the contents of relevant files. Source code isn't always self-explanatory, so agents may need documentation that's co-located with the code (or some other place that's cheap to search).

Rémi Louf's article "[The bottleneck was never the code](https://www.thetypicalset.com/blog/thoughts-on-coding-agents)" describes how engineers in an organization "accrete [context] by osmosis." In short, we learn the history and "why's" of our organization and codebases by observing or participating in discussions, and through what I like to call "code archaeology." That context that you gather & synthesize was always important to [document & share with peers](/blog/amortize-your-learning-by-writing-how-to-guides), but now it's also important to machines. If the conventions, axioms, or intent of your code isn't obvious to you, it probably won't be obvious to your agent, either.

_The [glue work](https://www.noidea.dog/glue) of building and maintaining a code knowledge base was always a nonnegotiable, but that might be more widely understood now._

## Co-located documentation

If you're working with agents, you probably already have an `AGENTS.md` file (or similar) with an overview of your code's architecture, organization, style guide, test instructions, and other standards. Information that's necessary to be in every agent's context to navigate and effectively modify & test the code.

Other standards and documentation you may want to co-locate with your code inclu
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTI4NDI4OTk2MiwxOTAwODI4OTIyLDIwMz
kzNDk3NTksLTkyODU5NTkyNywtMTAwNDI0MjQ5NCwxNjI5MDkw
ODEyXX0=
-->