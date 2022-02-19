---

title: Types of Probes in Kubernetes
date: 2030-01-01
tags:
- kubernetes
- microservices

---

It's tempting to use the same health check endpoint for multiple probes in Kubernetes, but the kubelet uses those probes for very different purposes.

The Kubernetes [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/) employs three different types of probes to help manage containers. Probes are typically RPC requests to a health check endpoint, but can also be commands executed inside of containers.

Probes are used to help detect and respond to:

- Containers that haven't started yet and wouldn't successfully serve traffic
- Containers that are overwhelmed and can't successfully serve additional traffic
- Containers that are completely dead and can't serve any traffic

(TODO: find a way to change the word "traffic" so it also accounts for message-based microservices)

## The liveness probe

The **liveness** probe is used to catch deadlocks or pods that have stopped processing, situations where restarting the pod would solve the problem. In these situations the pod is determined to be dead, and it will not revive no matter how much time you wait. It is somewhat expected that with enough time long-running services will enter a broken state, and this probe is designed to fix that.

This is primarily what I talked about in "[Writing Meaningful Health Check Endpoints](/blog/writing-meaningful-health-check-endpoints/)" and is likely what most people think of in respect to service orchestrator probes.

Without a liveness probe defined, Kubernetes will take an action based on the pod's restart policy when a container stops (or crashes).

_Note: the liveness probe doesn't wait for the readiness probe to succeed, so you may want to configure a delay or a startup probe._

## The readiness probe

The **readiness** probe is used to know if a container is ready to serve traffic. This could apply to newly started containers that aren't yet ready to serve traffic, or existing containers that are overwhelmed and can't handle additional traffic.

This may be extremely non-obvious from the plain English definition of the word "ready", but the readiness probe is run throughout the entire lifecycle of the container. That means that containers can go in and out of "ready" which will add and remove them from the load balancer, respectively. This is easy to confuse with "startup" probes which we will discuss next.

Without a readiness probe defined, Kubernetes will route traffic to containers as soon as they start.

_Note: a pod is considered "ready" when all of its containers are ready._

## The startup probe

The **startup** probe is used to know when a container has started. If a startup probe is configured, the liveness and readiness checks are disabled until the startup check succeeds once, so those probes won't interfere with the application starting. Startup probes are primarily used for slow-starting containers so the kubelet won't kill them because of a failing liveness check.

Without a startup probe define, Kubernetes will start running the liveness and readiness probes after the container starts.

## Cautions

Here are a few cautions on probes:

- **Overwhelmed**: be careful that your readiness and liveness probes aren't run so often that they overwhelm a container

(TODO: more?)
