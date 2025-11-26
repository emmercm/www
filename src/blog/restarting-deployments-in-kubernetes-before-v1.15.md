---

title: Restarting Deployments in Kubernetes Before v1.15
date: 2020-07-10T15:28:00
tags:
- kubernetes

---

Restarting resources such as deployments in Kubernetes is a fairly common task, but before v1.15 it wasn't very straight-forward.

_See "[Restarting Resources in Kubernetes v1.15+](/blog/restarting-resources-in-kubernetes-v1.15)" for a much simpler way to restart resources in Kubernetes v1.15+. v1.15 was released on Jun 19, 2019._

## One way

One of the most common ways to restart resources you'll see online is to reduce a deployment's replica count to zero and then back up to its previous number. This isn't great for a number of reasons:

- At some point in time you will have zero replicas running, which might have drastic consequences in production.
- It may not respect your [deployment strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy). This way of restarting is the same as the "recreate" deployment strategy, and that may not be desired.
- If you're using [horizontal pod autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) it will likely fight you.

## A better way

Editing a deployment's pod template will cause a rollout, so we can edit the template with a change that has no effect but will cause the rollout anyway. You only need to make a change to one container in the pod template in order to cause this.

One way of doing this is by adding/setting an environment variable such as `LAST_MANUAL_RESTART` with an ever-changing value such as the output from `date +%s`.

First, let's get the first container name in the pod template (replacing `<DEPLOYMENT>` with your deployment name):

```shell
$ kubectl get deployment --output=jsonpath="{.spec.template.spec.containers[*].name}" "<DEPLOYMENT>" | tr -s '[[:space:]]' '\n' | head -1
```

Then we can patch the deployment to cause a rollout like this (still replacing `<DEPLOYMENT>` with your deployment name, and now also `<CONTAINER>` with the container name you just found):

```shell
$ kubectl patch deployment "<DEPLOYMENT>" --patch="{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"<CONTAINER>\",\"env\":[{\"name\":\"LAST_MANUAL_RESTART\",\"value\":\"$(date +%s)\"}]}]}}}}"
```

You can string those together and make yourself an alias such as:

```bash
# Reboot a Kubernetes deployment
# @param {string} $1 Deployment name
kreboot() {
  CONTAINER=$(kubectl get deployment --output=jsonpath="{.spec.template.spec.containers[*].name}" "$1" | tr -s '[[:space:]]' '\n' | head -1)
  kubectl patch deployment "$1" --patch="{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"${CONTAINER}\",\"env\":[{\"name\":\"LAST_MANUAL_RESTART\",\"value\":\"$(date +%s)\"}]}]}}}}"
}
```

## Conclusion

I think this offers a much cleaner way to restart a deployment than strategies such as editing the replica count twice, but really you should just update past Kubernetes v1.15 as it's more than a year old and it'll give you access to `kubectl rollout restart <resource>`.
