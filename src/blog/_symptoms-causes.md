---

title: Alert on Symptoms, not Causes
tags:
- monitoring
- sre

---

If your system's CPU stays at 100% for minutes, does it actually matter?

The systems that you operate have performance characteristics that they are designed to meet. These are typically described in terms of:

- **Availability.** Your system should be able to serve requests that are made to it.
- **Latency.** Your system should serve requests as quickly as clients need.
- **Throughput.** Your system should serve the amount of traffic that clients need.
- **Correctness.** Your system should behave the way it's supposed to.

These are [service-level indicators (SLIs)](/blog/slis-slos-and-slas-what-are-they), which are used to provide performance guarantees to your customers (SLOs, SLAs).

Your internal clients (i.e. other engineering teams) and external clients (i.e. customers) don't care about anything else. So why would you monitor anything else?

## Symptoms

The Cambridge Dictionary defines a [_symptom_](https://dictionary.cambridge.org/us/dictionary/english/symptom) as:

> any single problem that is caused by and shows a more serious and general problem

Some example symptoms of an unhealthy system are:

- **[Low availability](/blog/your-service-should-make-a-sound-when-it-flatlines) (measured from the client's perspective):**
  - A high rate of RPC timeouts to the system.
  - A high rate of unexpected RPC error responses, such as HTTP 5xx errors. This includes failures to accept valid commands or enqueue work.
  - A high rate of network connection refusals or resets.
  - Service discovery or DNS resolution failures.
- **High latency:**
  - Long RPC response times.
  - Long individual message processing time.
  - Long waits between message production and consumption times (high queue depth).
  - Long individual batch job processing time.
  - High data replication lag.
- **Low throughput:**
  - High (or growing) message queue depth (messages are being produced faster than they are consumed).
  - Queued runs of cron jobs that aren't allowed to overlap.
- **Low correctness:**
  - Data lost after acknowledgement.
  - Messages processed out of order.
  - Messages produced to a dead-letter queue (DLQ).
  - At-least-once or at-most-once semantic violations.
  - Security rules violations.

_(The definition of "low" and "high" above will be driven by the needs of your clients and the guarantees you have made to them.)_

You want your automated alerts to be based on _symptoms_. This is what your clients care about, so it needs to [page you](/blog/if-it-doesnt-page-me-im-not-looking-at-it).

## Causes

The Cambridge Dictionary defines a [_cause_](https://dictionary.cambridge.org/us/dictionary/english/cause) as:

> the reason why something, especially something bad, happens

Some example causes of an unhealthy system are:

- **Low availability:**
  - Out-of-memory exceptions.
  - Startup failures.
  - Workload scheduling failures.
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

You typically do _not_ want your automated alerts to be based on causes. Many causes aren't actionable on their own, for example:

- Sustained high CPU usage doesn't matter unless it threatens latency or throughput guarantees. In fact, it might be _desirable_ to have high CPU usage, as it may mean that the application is tuned well.
- Retryable request failures don't matter unless they threaten availability or latency guarantees.
- Retryable batch job failures don't matter unless they threaten latency or throughput guarantees.

Work through the thought exercise on your own: _if you were to be paged for high CPU, high memory RSS, or a high rate of error logs, could you describe the client impact, or if any action is even necessary?_

Where causes _do_ belong is in your observability tooling. When you _do_ get paged on a symptom, you will want a clear application dashboard to help you diagnose and address the root cause.

## Actionable causes

The big asterisk&ast; to "alert on symptoms and not causes" is: there are causes that are very strong predictors of future unhealth that you still need to care about. Some examples:

- Data store running out of storage soon.
- Certificates expiring soon.
- Application replica count persistently below the desired count.
- Permanent loss of a data store replica.

Even if these kinds of situations might not initially cause impact to clients, they have a high chance of causing you to break your guarantees unless a human takes action. Depending on the issue and the runway left, some of these don't need to page overnight and can be handled during working hours.

## What about mean-time-to-detect?

One question that might come to mind is: _aren't causes a leading indicator and symptoms a lagging indicator? Won't this slow down my ability to be notified to a real problem?_

Maybe. It depends on the cause and the severity. Some causes may need to be occurring consistently for a while before there is any client impact. For a particularly severe issue, it may only require the minimum metric evaluation window (frequently 5 minutes) to show client impact, so then the mean-time-to-detect is the same as if you alerted on .


Here is a list of example metrics that are relatively easy to observe that

Symptoms can be defined as: what is

(transient issues are what you should care about, things like disk pressure likely don't get better)

These states might, for example, trigger an alert if CPU is above 80%, or if available memory is below 10%, or if disk space is nearly full, or if more than x many threads are running, or any set of other simplistic measures of underlying system conditions. While such simplistic “potential-cause” measures are easy to collect, they don’t produce meaningful alerts for you to act upon.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 203). (Function). Kindle Edition. 

In a time of complex and interdependent systems, teams can easily reach fatigue from the deluge of alerts that may, but probably don’t, reliably indicate a problem with the way customers are currently using the services your business relies on. Alerts for conditions that aren’t tied directly to customer experience will quickly become nothing more than background noise.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 207). (Function). Kindle Edition. 

## Additional reading

- Google: [Why Focus on Symptoms, Not Causes?](https://cloud.google.com/blog/topics/developers-practitioners/why-focus-symptoms-not-causes)
- Datadog: [Monitoring 101: Investigating performance issues](https://www.datadoghq.com/blog/monitoring-101-investigation/)
- O'Reilly: [Observability Engineering, 2nd Edition](https://www.oreilly.com/library/view/observability-engineering-2nd/9781098179915/)
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTE3MzU1MDIyMCwxNjM3ODQ0MjczLC0xNj
UxOTMwNzk1LDExMzkyMzM2MTIsNjA1MDQ0MDYzLDE0OTgwNDY1
MjYsLTgxMzE3MjczMiw5NTc2ODk1MTgsLTE1NDY2OTQ3NjMsLT
EyNjQwMTI2ODBdfQ==
-->