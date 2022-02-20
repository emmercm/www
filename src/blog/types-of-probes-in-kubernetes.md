---

title: Types of Probes in Kubernetes
date: 2022-02-20T04:50:00
tags:
- kubernetes
- microservices

---

It's tempting to use the same health check endpoint for multiple probes in Kubernetes, but the kubelet uses each probe for very different purposes.

The Kubernetes [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/) employs three different types of probes to help manage containers. Probes are typically RPC requests to a health check endpoint but can also be a command executed inside a container.

Probes are used to help detect and respond to:

- Containers that haven't started yet and can't successfully serve traffic
- Containers that are overwhelmed and can't successfully serve additional traffic
- Containers that are completely dead and aren't serving any traffic or processing any messages

## The liveness probe

The **liveness** probe is used to catch deadlocks or pods that have stopped processing - situations where restarting the pod would solve the problem. In these situations the pod is determined to be dead, and it will not revive no matter how long you wait. It is somewhat expected that with enough time that long-running services will enter a broken state, and this probe is designed to fix that.

This is primarily what I talked about in "[Writing Meaningful Health Check Endpoints](/blog/writing-meaningful-health-check-endpoints/)" and is likely what most people think of in respect to service orchestrator probes.

Without a liveness probe defined, Kubernetes will take an action based on the pod's restart policy when a container's PID 1 stops, generally restarting the container.

## The readiness probe

The **readiness** probe is used to know if a container is ready to serve traffic. This applies to newly started containers that aren't ready to serve traffic yet as well as existing containers that are overwhelmed and can't handle additional traffic.

This may be extremely non-obvious from the plain English definition of the word "ready", but the readiness probe is run throughout the entire lifecycle of the container. That means that containers can go in and out of "ready" which will add and remove them from the load balancer, respectively. This is easy to confuse with startup probes which we will discuss next.

You don't always need a liveness probe, a server may be simple enough that crashes always result in the PID 1 exiting, but almost _every_ service serving traffic should have a readiness probe.

Without a readiness probe defined, Kubernetes will route traffic to containers as soon as its PID 1 has started.

_Note: a pod is considered "ready" when all of its containers are ready._

_Note: the liveness probe doesn't wait for the readiness probe to succeed, so you may want to configure a delay or a startup probe._

## The startup probe

The **startup** probe is used to know when a container has started. If a startup probe is configured, the liveness and readiness checks are disabled until the startup check succeeds _once_, so that those probes won't interfere with the application starting. Startup probes are primarily used for slow-starting containers so the kubelet won't kill them because of a failing liveness check.

Startup probes graduated from beta to stable with [Kubernetes v1.20](https://kubernetes.io/blog/2020/12/08/kubernetes-1-20-release-announcement/) in December 2020, so you may find older guides on the internet using readiness probes for the startup check, but you shouldn't anymore.

Without a startup probe defined, Kubernetes will start running the liveness and readiness probes as soon as the container's PID 1 has started.

## Cautions

Here are a few cautions on probes:

- **Availability**: if you design your readiness probe such that it's possible for every container to fail it at the same time (e.g. depending on connectivity to a flaky downstream service), then it's possible to have zero pods in your load balancer
- **Overwhelming**: be careful that your readiness and liveness probes aren't run so often that they overwhelm a container
- **Timeouts**: the default probe timeout is 1 second, so make sure your health checks are fast, or you will get false negatives
- **False positives**: make sure you use the same web server for your health check endpoints that you do for your production traffic, using different servers may give false positives that the service is working
