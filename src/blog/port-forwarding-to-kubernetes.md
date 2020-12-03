---

title: Port-Forwarding to Kubernetes
date: 2020-06-23T00:12:00
tags:
- kubernetes

---

If you're using Kubernetes, it's likely you have services without public ingresses in production, which makes sending test requests to them hard - but Kubernetes offers a number of way to port forward to these services.

The two main tools you can use to port forward are:

- [`kubectl`](https://kubernetes.io/docs/reference/kubectl/overview/), the standard Kubernetes control tool
- [`k9s`](https://github.com/derailed/k9s), a TUI for controlling Kubernetes

We'll cover `kubectl` first because the basic concepts carry over to `k9s`.

## `kubectl`

The basic `kubectl port-forward` usage is:

```bash
kubectl port-forward <resource> [<local port>:]<remote port>
```

Where `<resource>` can be any of the following:

- A pod: `pod/sample-service-b68464b55-5xjkw`
- A deployment: `deployment/sample-service`
- A replica set: `replicaset/sample-service-55cbf8d66`
- A service: `service/sample-service`

Given a `<remote port>` of `8080`, there are some options for `<local port>`:

- Local port equals remote port: `8080`
- Local port is specified: `5000:8080`
- Local port is random: `:8080`

### Examples

**Forwarding to a specific pod** - maybe it's a known misbehaving pod and you want to make test requests to it to figure out what is happening:

```bash
kubectl port-forward pod/sample-service-b68464b55-5xjkw 8080
```

**Forwarding to a specific deployment** - maybe you don't care what pod serves your request, but you do care what local port is used:

```bash
kubectl port-forward deployment/sample-service 5000:8080
```

It's likely your deployment, replica set, and service all have very similar names and could be used interchangeably - but only you know your environment.

### Bash Alias

Here's a Bash alias I tend to use frequently:

```bash
# Open a port forward session to a remote Kubernetes deployment
# @param {string} $1 Deployment name
# @param {number} $2 Local+remote OR local port number
# @param {number=} $3 Remote port number
kforward() {
    kubectl port-forward "deployment/$1" "$2${3:+:$3}"
}
```

## `k9s`

A more user-friendly option is `k9s` where you can find, filter, and select resources to port forward to with a TUI.

Here are the `k9s` commands to list the different resources mentioned above:

- Pods: `:po`, `:pod`, or `:pods`
- Deployments: `:dp`, `:deployment`, or `:deployments`
- Replica sets: `:rs`, `:replicaset`, or `:replicasets`
- Services: `:svc`, `:service`, or `:services`

Then once you have the resource you'd like to forward to selected, the hotkey is `<shift-f>` and then you'll be presented with port options similar to the ones described above.

To view active port forwards in your `k9s` session (because you can have multiple active), the command is: `:pf`, `:portforward`, or `:portforwards`. You can delete active forwards with `<ctrl-d>`.
