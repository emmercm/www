---

title: Getting Started With minikube
date: 2020-11-01T19:59:00
tags:
- kubernetes

---

`minikube` is a tool for running a Kubernetes clusters for local development, and the setup of it is super simple.

We'll be using [Docker](https://www.docker.com/) to run `minikube`, so make sure that's [installed](https://www.docker.com/get-started).

Follow the `minikube` [installation instructions](https://minikube.sigs.k8s.io/docs/start/) for your OS, or if you're on macOS you can easily install it with [Homebrew](https://brew.sh/):

```bash
brew install minikube
```

Afterwards, we can verify everything is installed correctly with a few commands (ignoring the specific versions):

```bash
$ minikube version
minikube version: v1.14.2
commit: 2c82918e2347188e21c4e44c8056fc80408bce10

$ kubectl version
Client Version: version.Info{Major:"1", Minor:"18", GitVersion:"v1.18.8", GitCommit:"9f2892aab98fe339f3bd70e3c470144299398ace", GitTreeState:"clean", BuildDate:"2020-08-13T16:12:48Z", GoVersion:"go1.13.15", Compiler:"gc", Platform:"darwin/amd64"}
```

Then we'll go ahead and start `minikube`:

```bash
$ minikube start
😄  minikube v1.14.2 on Darwin 10.15.7
✨  Automatically selected the docker driver
👍  Starting control plane node minikube in cluster minikube
...
🐳  Preparing Kubernetes v1.19.2 on Docker 19.03.8 ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" by default
```

This will create a `kubectl` configuration file at `~/.kube/config` so no additional environment setup should be necessary.

We can verify `minikube` started correctly with some more commands (ignoring the specific IPs and ports):

```bash
$ minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured

$ kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /Users/<username>/.minikube/ca.crt
    server: https://127.0.0.1:32772
  name: minikube
contexts:
- context:
    cluster: minikube
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /Users/<username>/.minikube/profiles/minikube/client.crt
    client-key: /Users/<username>/.minikube/profiles/minikube/client.key

$ kubectl get services
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   14s
```

That tells us the cluster is up and running and `kubectl` is able to interact with it.

We can get a nice web interface with the command:

```bash
$ minikube dashboard
🔌  Enabling dashboard ...
🤔  Verifying dashboard health ...
🚀  Launching proxy ...
🤔  Verifying proxy health ...
🎉  Opening http://127.0.0.1:65153/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/ in your default browser...
```

Which should also show us that the only Kubernetes service that's running is `kubernetes`.

## Running an echo server

Now that the cluster is up and running let's run a container in it! We're going to use the Google Cloud Platform [echoserver](https://console.cloud.google.com/gcr/images/google-containers/GLOBAL/echoserver) image.

This is not a complete guide on Kubernetes, and as such we won't cover what resources exist and how they interact. I recommend [Learn Kubernetes in Under 3 Hours](https://www.freecodecamp.org/news/learn-kubernetes-in-under-3-hours-a-detailed-guide-to-orchestrating-containers-114ff420e882/) as a great place to start.

First, we'll create a _deployment_ which will implicitly create a _replica set_ and a _pod_ for us:

```bash
$ kubectl create deployment echoserver --image=k8s.gcr.io/echoserver:1.10
deployment.apps/echoserver created

$ kubectl get deployments
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
echoserver   1/1     1            1           14s

$ kubectl get replicasets
NAME                   DESIRED   CURRENT   READY   AGE
echoserver-9d94d584f   1         1         1       24s

$ kubectl get pods
NAME                         READY   STATUS    RESTARTS   AGE
echoserver-9d94d584f-d8rx6   1/1     Running   0          29s
```

By default the pod is only accessible from inside the cluster, so we need to expose it as a _service_:

```bash
$ kubectl expose deployment echoserver --type=LoadBalancer --port=8080
service/echoserver exposed

$ kubectl get services
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
echoserver   LoadBalancer   10.98.199.191   <pending>     8080:30326/TCP   3s
kubernetes   ClusterIP      10.96.0.1       <none>        443/TCP          26m
```

But because we're running `minikube` in Docker, and our Docker container doesn't have port 8080 exposed, we won't be able to access our pod just yet.

One way to access the service is to have `minikube` open it in our web browser:

```bash
$ minikube service echoserver
|-----------|------------|-------------|---------------------------|
| NAMESPACE |    NAME    | TARGET PORT |            URL            |
|-----------|------------|-------------|---------------------------|
| default   | echoserver |        8080 | http://192.168.49.2:30326 |
|-----------|------------|-------------|---------------------------|
🏃  Starting tunnel for service echoserver.
|-----------|------------|-------------|------------------------|
| NAMESPACE |    NAME    | TARGET PORT |          URL           |
|-----------|------------|-------------|------------------------|
| default   | echoserver |             | http://127.0.0.1:51830 |
|-----------|------------|-------------|------------------------|
🎉  Opening service default/echoserver in default browser...
```

Which will open a web page that echoes our HTTP GET request back to us.

Another way we can access the service is to tunnel/port-forward into the cluster with either `minikube` or `kubectl`:

```bash
$ minikube tunnel
🏃  Starting tunnel for service echoserver.
```

```bash
$ kubectl port-forward service/echoserver 8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
```

And then in a separate window we can now access our service:

```bash
$ curl localhost:8080
Hostname: echoserver-9d94d584f-d8rx6

Pod Information:
	-no pod information available-

Server values:
	server_version=nginx: 1.13.3 - lua: 10008

Request Information:
	client_address=127.0.0.1
	method=GET
	real path=/
	query=
	request_version=1.1
	request_scheme=http
	request_uri=http://localhost:8080/

Request Headers:
	accept=*/*
	host=localhost:8080
	user-agent=curl/7.64.1

Request Body:
	-no body in request-
```

## Tips

If at any point you run into unrecoverable state, you can reset `minikube` with the commands:

```bash
minikube delete
minikube start
```
