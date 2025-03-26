---

title: "Discussion Guide: The Pragmatic Programmer, 20th Anniversary"
draft: true

---

# Chapters 8-9

-   Favorite topic?
    
    -   8-45: The requirements pit
        
    -   8-46: Solving impossible puzzles
        
    -   8-47: Working together
        
    -   8-48: The essence of agility
        
    -   9-49: Pragmatic teams
        
    -   9-50: Coconuts don’t cut it
        
    -   9-51: Pragmatic starter kit
        
    -   9-52: Delight your users
        
    -   9-53: Pride and prejudice
        
-   (Topic 45) Have you ever taken the advice of sitting with a user of your software for an extended period? Was it an effective use of your time? What did you learn from that experience?
    
-   (Topic 46) What is your favorite or most effective distraction to take when you’re struggling to solve a problem?
    
-   (Topic 47) Have you ever worked at a company that had a strong culture of pair or mob programming? What was your experience? What aspects of it would you like to use again?
    
-   (Topic 48) What’s the best example of an Agile culture that you’ve seen before? What made it better than other organizations?
    
-   (Topic 49) What team norms do you currently have that are generally well received and you find effective? Any new norms you wish your team would adopt?
    
-   (Topic 50) What do you think your current team, organization, or company is cargo culting from other companies? Is it working for you?
    

# Chapter 7

-   Favorite topic?
    
    -   7-37: Listen to your lizard brain
        
    -   7-38: Programming by coincidence
        
    -   7-39: Algorithm speed
        
    -   7-40: Refactoring
        
    -   7-41: Test to code
        
    -   7-42: Property-based testing
        
    -   7-43: Stay safe out there
        
    -   7-44: Naming things
        
-   (Topic 37) Do you make use of code prototypes regularly? Or do you find yourself getting attached to code you’ve written? Share a story about a time you wish, in hindsight, that you had thrown away your first draft.
    
-   (Topic 38) Have you encountered a comment from a past developer to the effect of “don’t change this or everything will break, and I don’t know why”? Do you think that piece of code suffered from too much coincidence?
    
-   (Topic 39) Have you ever used leetcode skills such as algorithm design and optimization in a job? What were the project(s)?
    
-   (Topic 40) In most organizations, securing time dedicated to only refactoring or paying down tech debt is difficult. What tips and tricks do you have for working it into your daily work?
    
-   (Topic 41) Do you regularly practice test-drive development (TDD)? Are there certain times you favor it or certain times you avoid it?
    
    -   Do you agree with the authors’ opinions that TDD is particularly useful for newer developers, and that TDD can cause some shortsightedness?
        
-   (Topic 42) A lot of people would argue that automated tests should be deterministic and not use randomized values. How do you feel about the example usage of [Hypothesis](https://hypothesis.readthedocs.io/en/latest/ "https://hypothesis.readthedocs.io/en/latest/"), even when used with other, static tests?
    
-   (Topic 44) What is your opinion on the tradition of “obscure, ‘clever’ names” for microservices?
    

# Chapters 5-6

-   Favorite topic?
    
    -   5-28: Decoupling
        
    -   5-29: Juggling
        
    -   5-30: Transforming programming
        
    -   5-31: Inheritance tax
        
    -   5-32: Configuration
        
    -   6-33: Breaking temporal coupling
        
    -   6-34: Shared state is incorrect
        
    -   6-35: Actors and processes
        
    -   6-36: Blackboards
        
-   (Topic 28) How often do you make a change and encounter seemingly unrelated unit tests start failing? Is this a problem with just a few packages or services, or many of them? How would you start to address this?
    
-   (Topic 29) Where could your team benefit from using finite state machines or pub/sub processing?
    
-   (Topic 29) Which of the responsive patterns do you think make sense to use across domain boundaries, and which do you think don’t: finite state machines, the observer/callback pattern, pub/sub, and reactive programming with streams?
    
-   (Topic 30) Does your team use the `Either<Problem, T>` pattern to optionally return errors from methods? How do you like it?
    
-   (Topic 31) How would you achieve mixin/trait behavior in Java? Does your team use a pattern like this?
    
-   (Topic 32) What do you think of all the ways we have at Attentive to externalize configuration (AWS SSM parameter store, AWS secrets manager, Spring properties files, etc.)?
    
-   (Topic 32) Does your team make use of any configuration APIs with a polling mechanism?
    
-   (Topic 34) Have you had to deal with or debug concurrency issues within a service? Between replicas of the same service? Between different services entirely?
    
-   (Topic 35) Do you think Attentive would benefit from applying the actor pattern to companies, subscribers, messages, or other entities?
    

# Chapters 3-4

-   Favorite topic?
    
    -   3-16: The power of plain text
        
    -   3-17: Shell games
        
    -   3-18: Power editing
        
    -   3-19: Version control
        
    -   3-20: Debugging
        
    -   3-21: Text manipulation
        
    -   3-22 Engineering daybooks
        
    -   4-23: Design by contract
        
    -   4-24: Dead programs tell no lies
        
    -   4-25: Assertive programming
        
    -   4-26: How to balance resources
        
    -   4-27: Don’t outrun your headlights
        
-   (Topic 16) What would the authors think about common binary serialization formats such as Protocol Buffers and Avro?
    
-   (Topic 18) What is your favorite IntelliJ shortcut, feature, or other life hack that has improved your development workflow?
    
-   (Topic 19) After book club, share your dotfiles repository in Slack if you have one!
    
-   (Topic 19) Have you ever worked at a place that didn’t use version control, or had poor hygiene around it? What do you think about it in hindsight?
    
-   (Topic 20) Do you have any stories about a bug that was particularly difficult to track down and reproduce? How did you reproduce it, fix it, and then make sure it never happened again?
    
-   (Topic 22) Do you keep something similar to an engineering daybook, physical or otherwise? What medium is it in, and do you use any digital technology for it? In what situations have you found its history of information useful?
    
-   (Topics 16-22) What are your thoughts on the authors' opinions on using plain text for everything, CLIs over IDEs, keyboard over mouse, and version control for everything?
    
-   (Topic 23) Have you ever worked with a code generation tool that lets you [design by contract](https://en.wikipedia.org/wiki/Design_by_contract "https://en.wikipedia.org/wiki/Design_by_contract")? Did you use it, and how effective was it?
    
-   (Topic 23) Not really for discussion, but curious if any could figure out why Exercise 15 (p.112) was included in this topic. Maybe just an editing mistake?
    
-   (Topic 24) In a web API world where exceptions can propagate to other services, how do you feel about the “crash early” tip? Where _should_ exceptions be handled?
    
-   (Topic 25) Has your team adopted Nullaway and Error Prone broadly? Have you addressed Error Prone warnings? Have you turned any of those warnings into errors?
    

#### Engineering Hacks:

-   [Helpful IntelliJ Templates](https://attentivemobile.atlassian.net/wiki/spaces/tactical/pages/4394942628) helps you generate file boilerplate
    

-   [Key Promoter X - IntelliJ IDEs Plugin | Marketplace](https://plugins.jetbrains.com/plugin/9792-key-promoter-x) helps you learn keyboard shortcuts
    
-   Multi Cursor in editors speeds up via parallelization
    

-   [btr :: workspaces](https://attentivemobile.atlassian.net/wiki/spaces/DEVEX/pages/4718657571) to only checkout packages/services that your team owns
    

-   [Atom Material Icons - IntelliJ IDEs Plugin | Marketplace](https://plugins.jetbrains.com/plugin/10044-atom-material-icons) has higher contrast and more varied icons
    

-   [GitHub - nvbn/thefuck: Magnificent app which corrects your previous console command.](https://github.com/nvbn/thefuck) autocorrect for the terminal
    
-   Using Search&Replace / regex is a time-saver
    

# Chapters 1-2

-   Favorite topic?
    
    -   1-1: It’s your life
        
    -   1-2: The cat ate my source code
        
    -   1-3: Software entropy
        
    -   1-4: Stone soup and boiled frogs
        
    -   1-5: Good-enough software
        
    -   1-6: Your knowledge portfolio
        
    -   1-7: Communicate!
        
    -   2-8: The essence of good design
        
    -   2-9: DRY-the evils of duplication
        
    -   2-10: Orthogonality
        
    -   2-11: Reversibility
        
    -   2-12: Tracer bullets
        
    -   2-13: Prototypes and post-it notes
        
    -   2-14: Domain languages
        
    -   2-15: Estimating
        
-   (Topic 3) How does your team handle “broken windows”? Is time reserved to fix them, or are they at least boarded over? Does your team generally understand the point at which a window gets broken?
    
-   (Topic 5) Attentive has a goal of generally shorter iteration cycles so feedback can be gathered and incorporated quickly. How is your team adhering to this in 2025?
    
-   (Topic 6) Besides the engineering book club, how are you investing in your programming “knowledge portfolio?” Do you have recent newsletters or books you’d recommend to others?
    
-   (Topic 7) Have you struggled to gain traction on a proposal recently, with your teammates or stakeholders? Did you find any advice from this topic actionable for this or other proposals you struggled with?
    
-   (Topic 8) Does Attentive have any pervasive patterns that name code difficult to change?
    
-   (Topic 10) Can you think of a unit test suite that takes significant work to set up? How would you describe the orthogonality of its unit under test?
    
-   (Topic 11) Have you tried to abstract the usage of some technology, or make the choice of it more reversible and found it was difficult to do so? Do you think it was a design flaw in the technology itself?
    
-   (Topic 12) How are you currently using tracer bullets (or “vertical slices”) in your projects? Are you finding iterating during implementation more effective than additional up-front design? How have they affected progress tracking and timeline adjustments?
    
-   (Topic 13) What’s the most creative way you have prototyped a programming or non-programming project before?
    
-   (Topic 14) Have you ever regretted abstracting some functionality into a domain-specific language (DSL)? Was the abstraction worth the effort?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTMzNzYyODIzM119
-->