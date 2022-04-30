---

title: Code Review Comment Prefixes
image: https://unsplash.com/photos/8JFMYz-a8Xo
date: 2020-11-06T21:32:00
tags:
- career
- github

---

Regardless of what style of code reviews you use, code reviews in general are an important tool to share expertise and improve quality, but sometimes the intention of comments can be lost.

Even when assuming good intentions, sometimes the _meaning_ of a comment can be unclear. For example, a reviewer could intend a comment to be a suggestion - a change not required for the code to receive approval - but the code author could interpret it as a blocking change request.

On the extreme end, some comments could be interpreted as _hostile_, depending on the writing style of the reviewer and the mood of the reader. Short comments such as "I'd use a [guard clause](https://en.wikipedia.org/wiki/Guard_(computer_science)) here" leave room for inferring the wrong tone, even if it was intended as a non-blocking opinion or suggestion.

## Prefixes

Something I've seen work effectively is to _prefix_ code review comments with a word or two to declare the intention and to set the tone. Below are some suggested prefixes, in increasing order of severity.

### Props/praise

For when you want to thank someone for their work. Maybe it pays down tech debt, makes other developers' lives better, or taught you something.

> Props: this set of tests was really awkward, thank you for making it easier to contribute to in the future!

> Props: I didn't know you could do this in JavaScript, I learned something new!

Comments like these help set a positive tone of the review.

### Question

This is to ask for clarification on something - code organization, architecture paradigm, business logic, overall goal - something. Questions don't ask for changes, but the answer to questions may inform future suggestions or blocking comments.

> Question: what change will users see as a result of this?

> Question: are there other teams that will be impacted by this change?

> Question: could you teach me what this exact line of code is doing?

Try to avoid the word "why" as it sounds accusatory.

### Nit/nitpick/opinion

An unimportant, potentially opinionated comment that doesn't have to be addressed in order for the entire change to receive approval. This prefix indicates possible [bike-shedding](https://en.wikipedia.org/wiki/Law_of_triviality) to the author, so it can help keep them focused on other, larger feedback.

> Nit: this `for` loop could be changed to a `foreach` loop, it might make your life easier.

> Nit: this function could be refactored so there's only one `return` statement, that would help ensure a consistent return type.

> Nit: this test could be split up into multiple tests, that way each test has only one responsibility.

### Suggestion/FYI

A less opinionated comment offering an alternative solution, or pointing the author to some information that might be unknown.

> FYI: this new function "A" looks very similar to an existing function "B", you may be able to re-use or extend "B".

> Suggestion: this part of the function is likely to be needed elsewhere in the future, it could probably be broken out into its own function.

> Suggestion: using a guard clause here could help reduce nested conditionals.

### Convention

Pointing out code that doesn't conform to organizational standards. Ideally this would be enforced automatically with a linter or some other tool.

> Convention: this looks like an integration test, we keep integration tests in this other folder here: (link).

> Convention: we follow PHP PSR-2 code style, the opening curly brace should be on the next line.

### Blocking

The only type of comment that should cause "request changes". This is to call out architecture, performance, security, or other major issues.

> Blocking: this query doesn't sanitize inputs and allows for SQL injection.

> Blocking: this endpoint doesn't match the Swagger API documentation.

> Blocking: all new features require matching tests.

It's probably a good idea to have a real-time talk about blocking comments so that the author can understand both the comment meaning and the reviewer's expectations.

## Remote first

Given remote work is the new norm, any little communication improvements like these comment prefixes can have a large effect - but even when everyone is in the office together, clear communication from reviewers is important to keep pull request lead time low.

## Additional reading

- [Conventional Comments](https://conventionalcomments.org/#labels)
- Sourcegraph's engineering handbook section on [code reviews](https://about.sourcegraph.com/handbook/engineering/code_reviews#what-makes-an-effective-code-review)
- Stack Overflow's "[How to Make Good Code Reviews Better](https://stackoverflow.blog/2019/09/30/how-to-make-good-code-reviews-better/)"
