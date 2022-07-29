---

title: Writing Meaningful Health Check Endpoints
image: https://unsplash.com/photos/zaXryNGMSfs
date: 2022-02-15T03:03:00
tags:
- kubernetes
- microservices

---

If your health check endpoints return a hard-coded response then you don't actually know the health of your service.

## What is a health check endpoint?

A microservice's **health check** or **heartbeat** endpoint (e.g. `GET /v1/health`) exists to let a requester know if the service instance is healthy or not. The response is typically an HTTP 200 (healthy) or non-200 (unhealthy) status. We can define _healthy_ as:

- The instance has started
- The instance has a live connection to its data stores (including message brokers)
- The instance is actively processing (serving requests, consuming messages, etc.)
- The instance has enough required resources (heap memory, disk space, etc.)

Service orchestrators and monitors (e.g. the Kubernetes [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)) periodically make requests to this endpoint to know whether a service instance is healthy, and if it is not then the orchestrator can take some kind of action (e.g. kill the instance and start a new one).

Polling a health check endpoint is a form of _black box monitoring_ where the requester has no visibility into the internals of the service, it only knows if it received a success or error response.

_For the purpose of this article we'll treat liveness and readiness probes as the same thing, but see "[Types of Probes in Kubernetes](/blog/types-of-probes-in-kubernetes)" for an explanation of the differences and why you may want separate health check endpoints for each._

## Having no health check is bad

Service orchestrators will use the health check endpoint to know when service instances have _started_. Once an instance is _healthy_ it will be added to the load balancer. If a service has no health check endpoint but has some startup time (e.g. warming an in-memory cache) you may get errors because the instance is having traffic routed to it before it can handle requests.

Service orchestrators also use the health check endpoint to know if service instances are still _alive_. If an instance is _unhealthy_ it will be removed from the load balancer. You may get similar errors in this scenario if the instance can no longer handle requests.

## Anemic health checks aren't much better

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

The response from `GET /v1/health` doesn't give us much _meaningful_ information about the status of the service instance, only that it started. We don't know if the instance:

- Can connect to and query its databases
- Is able to consume any incoming messages
- Is able to read from or write to any mounted volumes

In other words, we don't know if the instance is performing or can perform its primary function.

## What a health check shouldn't include

After seeing the above list of dependencies that a health check endpoint _should_ query, you may be tempted to query every dependency your service has. Here are some you _shouldn't_:

- **Internal dependent services.**

  As much as other health check guides recommend checking the health of downstream services, you shouldn't. A tenet of resilient microservices is being tolerant of failing or unhealthy dependent services - you should be using patterns such as retries and circuit breakers to recover wherever possible.

  Let's say you have a service `currency-api` that some large number of microservices in your ecosystem depend on. If `currency-api` starts failing, and all services that depend on it query `currency-api` in their health check, then you will have a cascading effect where all of those services will become unhealthy as well. A better pattern may be to keep a cache of the last known successful response, depending on your business requirements.

- **External (SaaS) dependent services.**

  Same reasoning as internal services, except these are services you have even less control over. If your service relies on a vendor and cannot use stale data, such as an identity provider, then your service should remain _healthy_ and respond with an appropriate error status. In this scenario, there is nothing _operably_ wrong with your service, it is performing as expected, so it remains healthy. You may still want to alert the owning team about the issue, however.

Because most service orchestrators respond to unhealthy services by restarting them, you want to stay away from reporting a service as unhealthy if a restart doesn't have a chance of fixing it. Otherwise, you may end up with a service stuck in a boot loop that could negatively impact your availability.

## Anatomy of a health check response

Most of the time a simple HTTP 200 or non-200 status is enough for a health check response. You could consider adding additional detail in the response so a human can gain more insight, but it might be just as effective to emit this information in logs or metrics.

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

Here are some deeper considerations when designing your health check endpoints:

- **Availability**: if you have your health check depend on a database, it could have similar availability problems that depending on external services have (laid out above), your service orchestrator could determine all instances to be unhealthy and then there won't be any to handle any traffic
- **Authentication**: if your service requires authentication you may need to exclude the health check endpoint so your service orchestrator can work.
- **Security**: you likely don't want to expose your internal state via publicly available health check endpoints unless you rely on a synthetics SaaS vendor, and if you do then you probably want authentication.
- **Throughput**: the health check may be called very frequently so service instances can fail and recover fast, you may need to consider this.
- **Response time**: you'll want to be mindful that the health check doesn't take too long to calculate and respond, service orchestrators may have a request timeout such as Kubernetes' default of 1 second.
- **Caching**: it could be expensive to calculate a holistic status of a service, you could potentially cache some parts of the health check in-memory.
- **Non-polling**: there may be metrics such as the last time a message was consumed that can't be polled for, your service may need store these in-memory so they can be reported on later.
- **SLOs**: if you have [SLOs or SLAs](/blog/slis-slos-and-slas-what-are-they/) defined for your service, chances are uptime is one of them, and having a health check endpoint can help you report on it.
