---

title: Alert on Causes, not Symptoms
tags:
- sre

---

If your machine's CPU reaches 100% for minutes, does it actually matter?

Symptoms can be defined as: what is

(transient issues are what you should care about, things like disk pressure likely don't get better)

These states might, for example, trigger an alert if CPU is above 80%, or if available memory is below 10%, or if disk space is nearly full, or if more than x many threads are running, or any set of other simplistic measures of underlying system conditions. While such simplistic “potential-cause” measures are easy to collect, they don’t produce meaningful alerts for you to act upon.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 203). (Function). Kindle Edition. 
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTQ5ODA0NjUyNiwtODEzMTcyNzMyLDk1Nz
Y4OTUxOCwtMTU0NjY5NDc2MywtMTI2NDAxMjY4MF19
-->