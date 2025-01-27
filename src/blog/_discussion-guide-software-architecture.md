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

I run the engineering book club at my current company, [Attentive](https://www.attentive.com/). For the pace of our book club, we committed to reading X chapters every 2 weeks. I personally appreciate having multiple discussions over time, I find I better retain content that way. These are the exact discussion prompts I used over the few months of reading the book, so they're colored by my personal experience and the current culture at Attentive. All prompts are wholly my own and are free to use by all.

## Chapter 1

-   Chapter 1: Do you think Attentive has any _truly_ unique problems we solved first or no other company has yet to solve?
    
-   Chapter 1: Attentive hasn’t used architectural decision records (ADRs) in [three years](https://github.com/attentive-mobile/code/tree/master/docs/architecture/decisions "https://github.com/attentive-mobile/code/tree/master/docs/architecture/decisions"). Teams instead tend to write requests for comments (RFCs). What is your opinion about ADRs? Are they worth reviving, or is the current push for more RFCs filling any gap?
    
-   Chapter 1: The authors recommend centrally managing and automating “fitness function” checks for code best practices. Attentive uses service scorecards via Cortex, but rules defined there are generally unenforced. If you were to add fitness functions for our Java services, what would you add?

## Chapter 2

-   Chapter 2: for architecture quantum to be separate, they need to be independently deployable. At Attentive, our shared protobuf contracts can necessitate complicated deployments. Would you classify our services as one quantum as a result of this, or not, and why?
    
-   Chapter 2: the authors state that in terms of architecture quanta and static coupling, if a set of monolith modules or microservices all rely on the same database, there is only one quantum. They do not provide any exceptions for databases that are segmented. Do you agree or disagree with this classification?
    
    -   They make the same statement about a shared front-end that doesn’t use micro front-ends as also always having only one quantum. Do you agree or disagree with this classification, and do you feel more or less strongly compared to the shared database?

## Chapter 3

-   Chapter 3: Do you think your team’s components or services are maintainable, and if not, what do you think they’re suffering from (component coupling, component cohesion, cyclomatic complexity, or component size)?
    
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
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTMzMjg0NDM4MSw1NjM1Mzk5NDYsLTgwNT
YwMTg3XX0=
-->