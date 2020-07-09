---

title: Restarting Resources in Kubernetes v1.15+
date: 2020-07-09T20:20:00
tags:
- kubernetes

---

Restarting deployments, pods, or other resources in Kubernetes is a fairly common task, and starting with Kubernetes v1.15 there's any easy command for it.

There's a bunch of reasons why you'd want to restart a resource in Kubernetes:

- The code running in a pod is in a "hung" state and liveness probes don't exist or aren't ejecting it.
- A config map has changed and a deployment restart is needed for it to be applied.
- You're doing some low-grade [chaos engineering](https://principlesofchaos.org) and want to check for crash/restart tolerance.
- And more!

Thankfully there's an easy command to restart different types of resources:

```bash
kubectl rollout restart <resource>
```

According to the [changelog](https://github.com/kubernetes/kubernetes/tree/master/CHANGELOG), here's the different resources that are supported right now:

- Deployments
- Daemon sets
- Stateful sets

Here's a quick example of how to restart a deployment named `api`:

```bash
$ kubectl rollout restart deployment/api
deployment.extensions/api restarted
```

Happy hacking!
