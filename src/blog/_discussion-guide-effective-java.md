
### Chapters 11-12

-   #78-84 concurrency
    
    -   Outside of our common Kinesis consumer libraries, do you know of any places we make use of threads or executor thread pools?
        
-   #85-90 serialization
    
    -   At Attentive, we use Protobuf for both server<>server and server<>UI (via GraphQL & gRPC) interaction. Have you worked with legacy systems at previous companies that used Java serialization, and what were your experiences?
        
    -   At Attentive, some teams write a lot of boilerplate code for JSON deserialization (constructor decorators, constructor field decorators, discriminator decorators on interfaces, etc.) and Protobuf deserialization (hand-written toProto and fromProto methods). Does anyone have a better method to teach?
        

### Chapters 9-10

-   #59-68 general programming:
    
    -   (#59) The author suggests using out-of-the-box libraries for correctness and performance reasons. Similar reasoning could be applied to third-party SDKs. Have you come across Java library deficiencies that led you to reinvent the wheel?
        
    -   (#61) Boxed primitives should really only be used for generics (parameterized types) for a number of efficiency and safety reasons. Have you found other effective uses for them?
        
    -   (#62) The author recommends not using string values when an enum is more appropriate. In the Attentive back-end, there is code that doesn’t follow that recommendation, such as using strings for well-known vendor names. Do you agree or disagree with these decisions?
        
    -   (#64) The author recommends using interface types for method parameters, method return types, local variable types, and class field types if appropriate. Org-wide presentations in 2022 on topics such as hexagonal architecture encourage this as well. Have you followed this advice, and have you noticed a positive difference in the code you wrote?
        
    -   (#67) Conventional wisdom says to not optimize before needed, as it can lead to problems such as poor readability and incorrectness. Do you have any light-hearted war stories about a time you or a colleague optimized before necessary?
        
-   #69-77 exceptions:
    
    -   (#70-71) Checked exceptions on methods put a burden on API callers, and we don’t seem to use them often at Attentive. Do you have good examples of where we use them, or at any previous job?
        
    -   (#72) The author suggests treating `Exception` and `RuntimeException` as abstract classes that you shouldn’t use. Does anyone have a strong reason for this?
        
    -   (#75) Exceptions in the Attentive back-end frequently make it through to the front-end as unhelpful and cryptic messages. Do we have a stack that handles user-facing error messages well, or have you seen a good way to handle these in the past?
        

### Chapters 7-8

-   #42-44 lambdas:
    
    -   The author suggests using method references over lambdas more often than not. When have you preferred lambdas over method references?
        
    -   The author suggests 1-3 lines as the max for lambdas. Does anyone know of some lambdas within Attentive code that are particularly easy to understand at a glance, or particularly egregious (e.g. with many parameters, with deep nesting)?
        
-   #45-48 streams:
    
    -   Streams frequently do not make code easier to read. When have you preferred streams over enhanced for loops?
        
    -   Streams work best with pure lambdas and methods. Does anyone know of some particularly egregious uses of streams within Attentive code? Could they be made better with method references?
        
    -   Processing a stream in parallel can lead to liveness and safety failures. Has anyone made good use of parallel stream processing? Does anyone have any horror stories?
        
-   #49-56 methods:
    
    -   Method and constructor parameters should be checked for a minimal amount of validity. Has anyone run into cases where validation saved you? Has anyone used tools to make validation easier?
        
    -   Methods that return Optional<T> force the caller to deal with non-present values. At Attentive, developers seem to be preferring optionals in new code. What is your opinion of them?
        

### Chapters 5-6

-   (Winged this while Dillon transferred ownership)
    

### Chapters 3-4

-   IntelliJ can help auto-generate override methods easily. What are your thoughts on using these tools? What about writing unit tests for such override methods? P46
    
-   The assertj package allows for complex assertions like “assert all fields are equal except fields X,Y”. What do you think of this compared to using `equals` overrides? P53
    
-   Is the author’s focus on performance of hash code methods? overblown?
    
-   Much of Chapter 3 seemed to boil down to: prefer composition over inheritance. Agree or disagree?
    
-   In several cases, the author is categorically opposed to breaking changes. Is it ever acceptable to make breaking API changes, and if so, under what conditions? P95
    

### Chapters 1-2

-   What were your favorite Items from this week of reading? Was there anything that you’re excited to try?
    
-   The later part of chapter 2 dives into destruction of complex objects. What are some real-life examples of object destruction that we’ve encountered at work?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE2MzI4NzAyMTRdfQ==
-->