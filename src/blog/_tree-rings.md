---

title: Tree Rings
draft: true
image: https://unsplash.com/photos/a-close-up-of-a-circular-pattern-on-a-wall-WHBWT21ZLJw
tags:
- career
- java

---

You can measure the growth of a tree by looking at its rings. Software at your company has rings, too.

I write a lot about [countering](/blog/avoiding-blanket-statements) [negativity](/blog/being-critical-of-past-developers) in software engineering. I believe people have a lot of productive solutions available to them.

I've developed a metaphor recently that has been landing with my colleagues:
  
> Software is like a tree. When you cut it open, you're going to find some growth rings. You'll see when various patterns got popularized across the company, when new libraries were adopted, and other positive changes. The old middle rings are going to look a little rotten.

You and I are both better developers than we were a couple of years ago. We've worked with new people that have brought new ideas, have experience with more design patterns, and have worked with code long enough to understand the pitfalls of past decisions. And everyone else in the company has grown, too, and are likely making decisions that you'd agree with now. And maybe you'll both disagree with them in another couple of years.

I've been at my current company long enough to see quite a few growth rings, here are some examples:

- Using [Immutables](https://immutables.github.io/) in Java instead of value objects with manually-written getters and setters; helping eliminate some nullability
  - And after upgrading to Java 17+, using record classes in some places
- Using more test fakes
- Some teams have chosen to pacakge classes [by feature](http://www.javapractices.com/topic/TopicAction.do?Id=205), rather than by layer

 such as immutable value objects, test doubles for volatile dependencies, package-by-feature organization, and more.  
<!--stackedit_data:
eyJoaXN0b3J5IjpbMzkwOTkzMDc2LC0xMDgxNDAyNTU1LDE2NT
AwMjM0MzQsLTMxMjk1MDM4Miw4OTQ3NDc4ODEsMTgyOTQ1MTc4
MiwtNjkzNzE1NjE3LDg0NTA3MjAzMiwxMzIxNjQ1MTY0LC0xNj
Y5Mzg2NDI4LDg2MTE2OTM0MF19
-->