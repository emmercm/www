---

title: Alert on Symptoms, not Causes
tags:
- monitoring
- sre

---

If your machine's CPU stays at 100% for minutes, does it actually matter?

The systems that you operate have performance characteristics that they are designed to meet. These are typically described as:

- **Availability.** Your system should serve requests that are made to it.
- **Latency.** Your system should serve requests in a timely manner.
- **Throughput.** Your system should serve the amount of traffic that clients need.

Your internal (i.e. other engineering teams) and external clients (i.e. customers) don't care about anything else. So


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
eyJoaXN0b3J5IjpbNjE4ODIxMDk3LDExMzkyMzM2MTIsNjA1MD
Q0MDYzLDE0OTgwNDY1MjYsLTgxMzE3MjczMiw5NTc2ODk1MTgs
LTE1NDY2OTQ3NjMsLTEyNjQwMTI2ODBdfQ==
-->