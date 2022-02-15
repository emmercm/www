---

title: Writing Meaningful Health Check Endpoints
image: https://unsplash.com/photos/zaXryNGMSfs
date: 2022-02-15T02:33:00
tags:
- kubernetes
- microservices

---

If your health check endpoints return a hard-coded response then you're writing them wrong.

## What is a health check endpoint?

A microservice's _health check_ or _heartbeat_ endpoint (e.g. `GET /v1/health`) exists to respond with a _success_ (e.g. HTTP 200) if the service instance is _healthy_, and an _error_ (e.g. HTTP 500 or timeout) if the instance is _unhealthy_. We can define _healthy_ as:

- The instance has started
- The instance has a live connection to its data stores (including message brokers)
- The instance is actively processing (serving requests, consuming messages, etc.)
- The instance has enough required resources (heap memory, disk space, etc.)

Service orchestrators and monitors (e.g. the Kubernetes [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)) periodically make requests to this endpoint to know whether a service instance is _healthy_, and if it is not then the monitor can take some kind of action (e.g. kill the instance and start a new one).

Making requests to a health check endpoint is a form of black box monitoring where the requester has no visibility into the internals of the service, it only knows if it received a success or an error response.

_For the purpose of this article we'll treat service liveness and readiness as the same thing, but know that they are separate and may require different health check endpoints._

## Having no health check is bad

Service orchestrators will use the health check endpoint to know when a service instances have started, and once the instance is _healthy_ it will be added to the load balancer. If a service has no health check endpoint but has some startup time (e.g. warming an in-memory cache), you may get errors because the instance is being routed traffic before it can handle requests.

## Anemic health check aren't much better

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

The response from `GET /v1/health` doesn't give us any _meaningful_ information about the status of the service instance, only that it started. We don't know if the instance:

- Can connect to and query its databases
- Is able to consume any incoming messages
- Is able to read from or write to any mounted volumes

In other words, we don't know if the instance is performing, or can perform, its primary function.

## What a health check shouldn't include

After seeing the above list of dependencies that a health check endpoint _should_ query, you may be tempted to query _every_ dependency your service has. Here are some you _shouldn't_:

- **Internal services you depend on.**

  As much as other health check guides recommend checking the health of downstream services, you shouldn't. A tenet of building resilient microservices is being tolerant of failing or unhealthy dependent services - you should be using patterns such as retries and circuit breakers to recover wherever possible.

  Let's say you have a service `currency-api` that some large number of microservices in your ecosystem depend on. If `currency-api` starts failing, and all services that depend on it query `currency-api` in their health check, then you will have a cascading effect where all of those services will become unhealthy as well. A better pattern may be to keep a cache of the last known successful response, dependent on business requirements.

- **External (SaaS) services you depend on.**

  Same reasoning as internal services, except these are services you have even less control over. If your service relies on a vendor and cannot use stale data, such as an identity provider, then your service should remain _healthy_ and respond with an appropriate error code. In this scenario, there is nothing operably wrong with your service, it is performing as expected, so it remains _healthy_. That doesn't mean you wouldn't want to alert the owning team to the issue, however.

Because most service orchestrators respond to unhealthy services by restarting them, you want to stay away from reporting a service as unhealthy if a restart doesn't have a chance of fixing it. Otherwise, you may end up with a service stuck in a boot loop that could impact your availability.

## Anatomy of a health check response

Most of the time a simple HTTP 200 or non-200 is enough for a health check response. You could consider adding additional detail in the response so a human can gain more insight, but it might be just as effective to emit this information in logs or metrics.

Here's an example response you could use:

```json
{
  "status": "UP",
  "uptime": 74.766,
  "checks": {
    "kafka": "UP",
    "postgresql": "UP",
    "heapSpaceFree": "88M"
  }
}
```

## Other considerations

Here are some less surface-level considerations when designing your health check endpoints:

- **Authentication**: if your service requires authentication but is not publicly available, you may need to exclude the health check endpoint from authentication so your service orchestrator can work.
- **Throughput**: the health check should be called as frequently as possible so the service instance can fail and recover fast, so this may need to be accounted for.
- **Response time**: you'll want to be mindful the health check doesn't take too long to calculate, orchestrators may have a request timeout such as Kubernetes' default of 1 second.
- **Caching**: it could be expensive to calculate a holistic status of a service, you could potentially cache some parts of the health check.
- **Non-polling**: there may be metrics such as the last time a message was consumed that can't be polled for, your service may need store these in memory so they can be checked later.
