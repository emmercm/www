---

title: Writing Meaningful Health Check Endpoints
date: 2030-01-01
tags:
- kubernetes
- microservices

---

(health checks are a form of black box monitoring)

(otherwise known as a heartbeat)

If your health check endpoints return a hard-coded response then you're writing them wrong.

## What is a health check endpoint?

A microservice's health check endpoint (e.g. `GET /v1/health`) exists to respond with a _success_ (e.g. HTTP 200) if the service is _healthy_, and an _error_ (e.g. HTTP 500 or timeout) if the service is _unhealthy_. We can define _healthy_ as:

- The service has started
- The service has a live connection to its data stores (including message brokers)
- The service is actively processing (serving requests, consuming messages, etc.)
- The service has enough required resources (heap memory, disk space, etc.)

These are all measures of if _this_ service is healthy and needs some action taken on it

Service monitors (orchestrators?) (e.g. the Kubernetes [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)) periodically make requests to this endpoint to know whether a service instance is _healthy_, and if it is not then the monitor can take some kind of action (e.g. kill the service and start a new instance).

_For the purpose of this article we'll treat service liveness and readiness as the same thing, but know that they are separate and may require different health check endpoints._

## Why an anemic health check is bad

Take this Node.js + Express example:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/v1/health', (req, res) => {
  res.json({ status: 'UP' })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

The response from `GET /v1/health` doesn't give us any _meaningful_ information about the status of the service, only that it started. We don't know if the service:

- Can connect to and query its databases
- Is able to consume any incoming messages
- Is able to read from or write to any mounted volumes

In other words, we don't know if the service is performing, or can perform, its primary function.

## What a health check shouldn't include

After seeing the above list of dependencies that a health check endpoint _should_ query, you may be tempted to query _every_ dependency your service has. Here are some you _shouldn't_:

- **Internal services you depend on.**

  As much as other health check guides recommend checking the health of downstream services, you shouldn't. A tenet of building resilient microservices is being tolerant of failing or unhealthy dependent services - you should be using patterns such as retries and circuit breakers to recover wherever possible.

  Let's say you have a service `currency-api` that some large number of microservices in your ecosystem depend on. If `currency-api` starts failing, and all services that depend on it query it in their health check, then you will have a cascading effect where all of those services will go unhealthy as well. A better pattern may be to keep a cache of the last known successful response, dependent on business requirements.

- **External (SaaS) services you depend on.**

  Same reasoning as internal services, except these are services you have even less control over. If your service relies on a vendor and cannot use stale data, such as an identity provider, then your service should remain _healt hy_ and respond with an appropriate error code. In this scenario, there is nothing operably wrong with your service, it is performing as expected, so it remains _healthy_. That doesn't mean you wouldn't want to alert the owning team to the issue, however.

(there are still some cases that break the above, like in the case of tight coupling)

## Anatomy of a health check response

(relationship to SLOs)
