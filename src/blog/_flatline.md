---

title: Your Service Should Make a Sound When it Flatlines
image: https://unsplash.com/photos/a-close-up-of-a-monitor-screen-with-a-heart-beat-beXUIzvxW-Q
tags:
- microservices
- sre

---

When (not _if_) your service dies, will you know?

It's important to be alerted when the processes you are responsible for are no longer having the expected outcome. Most of the time you want these alerts to be driven by well-defined [SLOs](/blog/slis-slos-and-slas-what-are-they). An obvious failure mode that will lead to breaking an SLO is if a service _flatlines_, as in it is no longer running or producing any output.

## Example scenarios

Some examples of flatlining include:

**Failure to start**

- The service runs on [Kubernetes](/blog/tag/kubernetes) and its pods can't be scheduled or are in a `CrashLoopBackOff`
- The service isn't being provided environment variables or other configuration it depends on to start

**Failure to be reached**

- A problem with service discovery or DNS resolution prevents clients from contacting the service

**Failure to make progress**

- Network connections or threads are not being released, causing other threads to wait forever
- Conflicting mutexes has caused a deadlock between threads
- The service repeatedly consumes a "poison pill" message, preventing consumption of subsequent messages

**Failure to stay alive**

- The service is overwhelmed with data, causing it to run out of memory
- A storage disk is full, or is made full every time a service runs

Some of these situations can be tricky to detect, but it is imperative that you try to.

## Example metrics

Here are some common failure metrics to monitor, that when they pass a certain threshold are likely to cause an SLO to be breached:

- **Service orchestration errors:** Kubernetes or other compute orchestrators should emit metrics when it fails to schedule services or if they fail to start.
- **Out-of-memory exceptions:** if a service runs out of memory multiple times then it is likely to keep doing so.
- **Large message queue depth:** if a message queue's depth rises above a certain threshold then it may indicate a service cannot make progress. 
- **Errors observed by clients:** if clients of your service observe an abnoraml rate of timeouts or errors it may indicate a problem with your service or the network in between.
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTUyMTIwODM4LDE2NzIwMjYyNTAsLTY1Mj
QwNzExLDE3NzcwNTEyODEsLTg1NDA5NDU5OSwtMTk3MjAzOTY2
OCw1MjIyMjM3ODAsNjk0MjQwMTgsLTM1OTgyNTE0MCwtMTQzMj
E3Mjc5Ml19
-->