---

title: I Don't Want to Have to Think About It
draft: true
tags:
- ci-cd
- opinion
- microservices
- sre

---

I spent a substantial amount of time in the first half of 2025 ensuring that I don't have to think about microservices my team owns that have a low rate of change.

- rnd-subscriber-pruning-service's use of Spring cron, preventing safe restarts for a week
- batch-subscriber-processor's lack of CD tests, making the Spring Boot 3 migration dangerous
- subscription-api's lack of CD tests, creating a business risk
- litigator-service's in-memory job queue, preventing safe restarts ever, requiring callers to pause
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTkzMzg0MTQxMF19
-->