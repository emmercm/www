---

title: I Don't Want to Have to Think About It
draft: true
tags:
- ci-cd
- opinion
- sre
- testing

---

I spent a substantial 

- rnd-subscriber-pruning-service's use of Spring cron, preventing safe restarts for a week
- batch-subscriber-processor's lack of CD tests, making the Spring Boot 3 migration dangerous
- subscription-api's lack of CD tests, creating a business risk
- litigator-service's in-memory job queue, preventing safe restarts ever, requiring callers to pause
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE2MzEzNjU2NzNdfQ==
-->