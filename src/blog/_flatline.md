---

title: Your Service Should Make a Sound When it Flatlines
image: https://unsplash.com/photos/a-close-up-of-a-monitor-screen-with-a-heart-beat-beXUIzvxW-Q
tags:
- microservices
- sre

---

When (not _if_) your service dies, will you know?

It's important to be alerted when the processes you are responsible for are no longer having their expected outcome. Most of the time you want these alerts to be driven by well-defined [SLOs](/blog/slis-slos-and-slas-what-are-they). An obvious failure mode that will lead to breaking an SLO is if a service _flatlines_, as in it is no longer running or making any progress.

## Example scenarios

Some examples of flatlining include:

**Failure to start**

- Your service runs on [Kubernetes](/blog/tag/kubernetes) and its pods can't be scheduled or are in a `CrashLoopBackOff`
- Your service isn't being provided environment variables or other configuration it depends on to start

**Failure to be reached**

- Clients of your service can't reach it because of a problem with service discovery or DNS resolution

**Failure to make progress**

- Your service isn't releasing network connections or threads, causing other threads to wait forever
- Your service is deadlocking due to conflicting mutexes
- Your service is repeatedly consuming a "poison pill" message from a queue, preventing progress

**Failure to stay alive**

- Your service is overwhelmed with data, causing it to run out of memory
- Your service is running on a server with a full disk, or it fills a disk every time it starts

Some of these situations can be tricky to detect, but it is imperative that you try to.

## Example metrics

Here are some common failure metrics to monitor, that when they pass a certain threshold are likely to cause an SLO to be broken:

- **Service orchestration errors:** Kubernetes or other compute orchestrators should emit metrics when it fails to schedule services or when services fail to start.
- **Out-of-memory exceptions:** if a service runs out of memory multiple times then it is likely to keep doing so.
- **Large message queue depth (backlog):** if a message queue's depth rises above a certain threshold then it may indicate a service cannot make progress.

  _Most durable message queues track the queue depth in terms of a message count, but some message queues may also track the age of the oldest message. Only rely on message age metrics being emitted by the broker, not your service! Because if your service doesn't consume anything then it can't emit a metric, which may cause a false positive of health._

- **Messages produced to a dead-letter queue (DLQ):** if a message fails to be processed multiple times, or within some reasonable timespan, then they should be routed to a DLQ to keep them from blocking other messages in the queue.

  _If you aren't using a DLQ, then you probably should, but you may instead be able to monitor a high message queue redelivery rate._

- **Errors observed by clients:** if clients of your service observe an abnoraml rate of timeouts or errors then it may indicate a systemic problem with your service or the network in between.

## Conclusion
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE3MTQ0MzM5OTAsMTY3MjAyNjI1MCwtNj
UyNDA3MTEsMTc3NzA1MTI4MSwtODU0MDk0NTk5LC0xOTcyMDM5
NjY4LDUyMjIyMzc4MCw2OTQyNDAxOCwtMzU5ODI1MTQwLC0xND
MyMTcyNzkyXX0=
-->