---

title: Alert on Symptoms, not Causes
tags:
- monitoring
- sre

---

If your system's CPU stays at 100% for minutes, does it actually matter?

The systems that you operate have performance characteristics that they are designed to meet. These are typically described as:

- [**Availability.**](/blog/your-service-should-make-a-sound-when-it-flatlines) Your system should correctly serve requests that are made to it.
- **Latency.** Your system should serve requests in a timely manner.
- **Throughput.** Your system should serve the amount of traffic that clients need.
- **Correctness.** Your system should behave the way it's supposed to.

These are [service-level indicators (SLIs)](/blog/slis-slos-and-slas-what-are-they), which are used to provide performance guarntees to your customers (SLOs, SLAs).

Your internal clients (i.e. other engineering teams) and external clients (i.e. customers) don't care about anything else. So why would you monitor anything else?

## Symptoms

The Cambridge Dictionary defines a [_symptom_](https://dictionary.cambridge.org/us/dictionary/english/symptom) as:

> any single problem that is caused by and shows a more serious and general problem

Some example symptoms of an unhealthy system are:

- **Low availability (measured from the client's perspective):**
  - A high rate of RPC timeouts to the system.
  - A high rate of RPC error responses, such as HTTP 5xx errors. This includes failures to accept valid commands or enqueue work.
  - A high rate of network connection refusals or resets.
  - Service discovery or DNS resolution failures.
- **High latency:**
  - Long RPC response times.
  - Long individual message processing time.
  - Long waits between message production and consumption times (high queue depth).
  - Long individual batch job processing time.
  - Long data replication lag.
- **Low throughput:**
  - High (or growing) message queue depth (messages are being produced faster than they are consumed).
  - Queued runs of cron jobs that aren't allowed to overlap.
- **Low correctness:**
  - Data lost after acknowledgement.
  - Messages processed out of order.
  - Messages produced to a dead-letter queue (DLQ).
  - At-least-once or at-most-once semantic violations.
  - Security rules violations.

_(The definition of "low" and "high" will be driven by the needs of your clients and the guarantees you have made to them.)_

## 

The Cambridge Dictionary defines a [_cause_](https://dictionary.cambridge.org/us/dictionary/english/cause) as:

> the reason why something, especially something bad, happens

Some example causes of an unhealthy system are:

- **Low availability:**
  - Out-of-memory exceptions.
  - Startup failures.
  - Workload scheduling failures..
  - Low availability of downstream systems or data stores.
- **High latency:**
  - High data store read or write times.
  - Long garbage colelctor (GC) pause times.
  - CPU contention or throttling.
  - Thread pool exhaustion.
- **Low throughput:**
  - Maxed application replicas.
  - Uneven work processing or hot shards.
  - Rate limits imposed by downstream systems.
  - High rate of message retries.

## Leading vs. lagging indicators


Here is a list of example metrics that are relatively easy to observe that

Symptoms can be defined as: what is

(transient issues are what you should care about, things like disk pressure likely don't get better)

These states might, for example, trigger an alert if CPU is above 80%, or if available memory is below 10%, or if disk space is nearly full, or if more than x many threads are running, or any set of other simplistic measures of underlying system conditions. While such simplistic “potential-cause” measures are easy to collect, they don’t produce meaningful alerts for you to act upon.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 203). (Function). Kindle Edition. 

In a time of complex and interdependent systems, teams can easily reach fatigue from the deluge of alerts that may, but probably don’t, reliably indicate a problem with the way customers are currently using the services your business relies on. Alerts for conditions that aren’t tied directly to customer experience will quickly become nothing more than background noise.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 207). (Function). Kindle Edition. 

## Additional reading

- https://cloud.google.com/blog/topics/developers-practitioners/why-focus-symptoms-not-causes
<!--stackedit_data:
eyJoaXN0b3J5IjpbNzM2OTQ4MTc4LC0xNjUxOTMwNzk1LDExMz
kyMzM2MTIsNjA1MDQ0MDYzLDE0OTgwNDY1MjYsLTgxMzE3Mjcz
Miw5NTc2ODk1MTgsLTE1NDY2OTQ3NjMsLTEyNjQwMTI2ODBdfQ
==
-->