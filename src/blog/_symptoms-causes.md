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

In a time of complex and interdependent systems, teams can easily reach fatigue from the deluge of alerts that may, but probably don’t, reliably indicate a problem with the way customers are currently using the services your business relies on. Alerts for conditions that aren’t tied directly to customer experience will quickly become nothing more than background noise.
Charity Majors. Observability Engineering: Achieving Production Excellence (p. 207). (Function). Kindle Edition. 
<!--stackedit_data:
eyJoaXN0b3J5IjpbNjA1MDQ0MDYzLDE0OTgwNDY1MjYsLTgxMz
E3MjczMiw5NTc2ODk1MTgsLTE1NDY2OTQ3NjMsLTEyNjQwMTI2
ODBdfQ==
-->