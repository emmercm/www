---

title: "Discussion Guide: Software Architecture: The Hard Parts"
date: 2025-01-26
tags:
- books
- databases
- microservices
- streaming

---

A guide with discussion prompts for Neal Ford, Mark Richards, Pramod Sadalage, and Zhamak Dehghani's [Software Architecture: The Hard Parts: Modern Trade-Off Analyses for Distributed Architectures](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/).

I run the engineering book club at my current company, [Attentive](https://www.attentive.com/). For the pace of our book club, we committed to reading 1-2 chapters (depending on the page count) every 2 weeks. I personally appreciate having multiple discussions over time, I find I better retain content that way. These are the exact discussion prompts I used over the few months of reading the book, so they're colored by my personal experience and the current culture at Attentive. All prompts are wholly my own and are free to use by all.

## Chapter 1

- Do you think Attentive has any _truly_ unique problems we solved first or no other company has yet to solve?  
- Attentive hasn’t used architectural decision records (ADRs) in [three years](https://github.com/attentive-mobile/code/tree/master/docs/architecture/decisions "https://github.com/attentive-mobile/code/tree/master/docs/architecture/decisions"). Teams instead tend to write requests for comments (RFCs). What is your opinion about ADRs? Are they worth reviving, or is the current push for more RFCs filling any gap?  
- The authors recommend centrally managing and automating “fitness function” checks for code best practices. Attentive uses service scorecards via Cortex, but rules defined there are generally unenforced. If you were to add fitness functions for our Java services, what would you add?

## Chapter 2

- For architecture quantum to be separate, they need to be independently deployable. At Attentive, our shared protobuf contracts can necessitate complicated deployments. Would you classify our services as one quantum as a result of this, or not, and why?
- The authors state that in terms of architecture quanta and static coupling, if a set of monolith modules or microservices all rely on the same database, there is only one quantum. They do not provide any exceptions for databases that are segmented. Do you agree or disagree with this classification?
  - They make the same statement about a shared front-end that doesn’t use micro front-ends as also always having only one quantum. Do you agree or disagree with this classification, and do you feel more or less strongly compared to the shared database?

## Chapter 3

- Do you think your team’s components or services are maintainable, and if not, what do you think they’re suffering from (component coupling, component cohesion, cyclomatic complexity, or component size)?
    
    -   _Definitions for quick reference:_
        
        -   _Component coupling: the degree and manner to which components know about one another_
            
        -   _Component cohesion: the degree and manner to which the operations of a component interrelate_
            
        -   _Cyclomatic complexity: the overall level of indirection and nesting within a component_
            
        -   _Component size: the number of aggregated statements of code within a component_
            
    -   Same question about analyzing your components or services' testability.
        
-   Chapter 3: Despite warnings about coupling and synchronous communication, the authors seem to believe microservices solve all architectural modularity problems. Do you agree?
    
-   Chapter 3: Have you ever made a refactor or re-architecture pitch to non-engineers using a strategy similar to Addison and Austen? What is it effective? How was it received?

## Chapter 4

- Chapter 4: The authors mention component-based decomposition and tactical forking as two effective strategies for decomposing a monolithic application. What other strategies have you heard of? Have you used any of them? What was your experience?

## Chapter 5

-   Have you framed refactors or re-architectures in terms of “architecture stories” before? Did you find it effective?
    
-   Does your team use a component-based (i.e. “clean architecture”, “modular monolith”) organization in your services or more of a layered architecture (i.e. MVC)?
    
-   What’s your opinion on the author’s component flatting strategy where no source files should exist in subdomains (parents of components)? Even if you aren’t decomposing them, do you think this would improve the organization of any of your services?
    
-   Many monolith fitness functions discussed also apply to microservices (maximum size, maximum level of coupling, etc.). Do you think those would be worthwhile metrics to instrument in Cortex?
    
-   What’s your opinion on how the Sysops Squad broke down their monolith? Do you think they ended up with the right number of domain services?

## Chapter 6

-   Do you operate any services that share a DB? Have you experienced any “data disintegrator” pain points (change control, connection management, scalability, fault tolerance, etc.)? Do you think those pain points outweighed the “data integrator” benefits?
    
-   The authors skip talking about _why_ cross-domain DB views might exist in this chapter, just that they need to be eliminated. Do you think the ease of performing data science on a monolithic DB should be a “data integrator”?
    
-   The authors describe a five-step process for monolithic DB decomposition. Have you used any other strategies effectively before (e.g. a dual-write pattern, or some kind of application-level sharding)?

## Chapter 7

-   Chapter 7: The authors don’t consider preexisting engineering team organization as a granularity integrator or disintegrator. Do you think it should be?
    
-   Chapter 7: The Sysops Squad combined profile info, credit card info, password info, and purchase product info into one service–using a preexisting authorization library to secure access. Do you think this is acceptable from a security standpoint, or would you have pushed back on profile inconsistency being a hard requirement?

## Chapter 8

-   Chapter 8: The authors assert that dependency management with many services and libraries (e.g. 200 and 40, respectively) “would quickly become overly complex and unmaintainable.” Do you agree? Or what strategies would you apply to counter this?
    
-   Chapter 8: Getting teams to deploy their services after a shared library version has been updated is difficult to coordinate. Do you think we do it well at Attentive (e.g. the `attnlib` Helm chart, or widely-used libraries such as `kinesis2` and `feature-flag-sdk`)? How would you do it differently?
    
-   Chapter 8: The sidecar pattern described that allows for the sharing of class files does not fit the Kubernetes idea of a sidecar container. How would you implement the sidecar pattern as described?

## Chapter 9

TODO

## Chapter 10

TODO

## Chapter 11

-   Chapter 11: Do you think the authors do a good job of fairly representing multiple approaches to a problem? Example on layered vs. modular monoliths: “both topologies are logical ways to organize a codebase… [but layered monoliths] increases the overall implementation complexity because now the architect must design for the _semantic_ complexity along with the additional _implementation_ complexity” (p. 310-311).
    
-   Chapter 11: Attentive’s event pipeline generally encourages choreography between services. What examples of orchestration do you know of within our architecture? What areas do you think could benefit from more orchestration?
    
-   Chapter 11: At the end of the chapter, do you think Sysops Squad considered orchestration vs. choreography fairly? For example, there was no mention of a single point of failure or centralized retries.

## Chapter 12

-   Chapter 12 Think about some of the microservice coordination architectures you’ve worked with in the past, can you neatly categorize them into one of the eight transactional saga patterns?
    
    -   If you experienced difficulty with them, can you name which of the three dimensions (communication, consistency, and coordination) caused the most difficulty?
        
-   Chapter 12: The authors don’t discuss and therefore don’t compare the testability of the various transactional saga patterns. From an end-to-end testing perspective, which feels the easiest or most difficult to test?

## Chapter 13

-   Chapter 13: Do you agree or disagree with this quote from early in the chapter: “architects aren’t forced to use strict contracts and should do so only when advantageous” (p. 367).
    
    -   Similarly, what is your opinion on the authors implying changes to strict contracts aren’t forward-compatible, requiring coordinated changes or versioned endpoints?
        
-   Chapter 13: Has your organization struggled with knowing what API response fields are actually used? Have you had issues with coordinating backward-incompatible changes because consumer needs were unclear? What did you do to solve this?

## Chapter 14

-   Chapter 14: Has your organization built or attempted to build a data warehouse, data lake, or data mesh? What was the difficulty in the initial implementation? What are the difficulties with the ongoing maintenance? How did you solve for ever-changing DB schemas?
    
-   Chapter 14: What are your thoughts about data meshes and data product quanta? Do you think it makes sense to push such responsibility to data originators, or does that sound like too much operational burden?
    
    -   How would you adopt the paradigm in a system that wasn’t built with it from the beginning?

## Chapter 15

TODO
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjAwODU3Njg3Nyw1NjM1Mzk5NDYsLTgwNT
YwMTg3XX0=
-->