---

title: Alert on Symptoms, not Causes
tags:
- monitoring
- sre

---

If your machine's CPU stays at 100% for minutes, does it actually matter?

The systems that you operate have performance characteristics that they are designed to meet. These are typically described as:

- [**Availability.**](/blog/your-service-should-make-a-sound-when-it-flatlines) Your system should correctly serve requests that are made to it.
- **Latency.** Your system should serve requests in a timely manner.
- **Throughput.** Your system should serve the amount of traffic that clients need.

These are [service-level indicators (SLIs)](/blog/slis-slos-and-slas-what-are-they), which are used to provide performance guarntees to your customers (SLOs, SLAs).

Your internal clients (i.e. other engineering teams) and external clients (i.e. customers) don't care about anything else. So why would you monitor anything else?

## Symptoms vs. causes

The Cambridge Dictionary defines [_symptom_](https://dictionary.cambridge.org/us/dictionary/english/symptom) as:

> any single problem that is caused by and shows a more serious and general problem

Some example symptoms of an unhealthy system are:

- **Low availability:**
  - A high rate of
- High latency (where "high" is defined 

(example unhealthy symptom)

(define cause)

(example causes of unhealth)

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
eyJoaXN0b3J5IjpbLTU2Mjc0MDcwMSwxMTM5MjMzNjEyLDYwNT
A0NDA2MywxNDk4MDQ2NTI2LC04MTMxNzI3MzIsOTU3Njg5NTE4
LC0xNTQ2Njk0NzYzLC0xMjY0MDEyNjgwXX0=
-->