---

title: Your Service Should Make a Sound When it Flatlines
image: https://unsplash.com/photos/a-close-up-of-a-monitor-screen-with-a-heart-beat-beXUIzvxW-Q
tags:
- microservices
- sre

---

When (not _if_) your service dies, will you know?

It's important to be alerted when the processes you are responsible for are no longer having the expected outcome. Most of the time you want these alerts to be driven by well-defined [SLOs](/blog/slis-slos-and-slas-what-are-they). An obvious failure mode that will lead to breaking an SLO is if a service _flatlines_, as in it is no longer running or producing any output.

Some examples of flatlining include:

**Failure to start**

- The service runs on [Kubernetes](/blog/tag/kubernetes) and its pods can't be scheduled or are in a `CrashLoopBackOff`

**Failure for clients to reach the service**

- A failure with service discovery or DNS resolution

**Failure to make progress**

- Network connections or threads are not being released, causing 
- The service has deadlocked, stopping all processing (failing the [liveness probe](/blog/types-of-probes-in-kubernetes) if it's on Kubernetes)

**Failure to stay alive**

- The service is overwhelmed with data, causing it to run out of memory, before it can emit the results of any processing
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTU3MjMxMDY1LDE3NzcwNTEyODEsLTg1ND
A5NDU5OSwtMTk3MjAzOTY2OCw1MjIyMjM3ODAsNjk0MjQwMTgs
LTM1OTgyNTE0MCwtMTQzMjE3Mjc5Ml19
-->