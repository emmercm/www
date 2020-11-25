---

title: Installing a Specific Version of Helm
date: 2020-11-25T02:31:00
tags:
- kubernetes

---

[Helm](https://helm.sh/), the package manager for [Kubernetes](https://kubernetes.io/), can be sensitive to the version of Tiller running in cluster, and as a result may require you to install a specific version.

If you've ever seen a `helm` CLI error such as:

```bash
Error: incompatible versions client[v2.17.0] server[v2.13.1]
```

then you've encountered this specific problem, but there are other reasons you may need or want an older version of `helm`.

## The commands

First, you'll want to uninstall any existing version of `helm` you have - through `brew`, `choco`, `apt`, `snap`, or any other source. That'll make sure you don't have multiple copies of `helm` in your `PATH`.

Then, find out what version you want, such as `2.13.1` from above, and run the commands:

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get
chmod +x get_helm.sh
./get_helm.sh -v v<version>
```

The "v" in front of the version is important, without you'll get an error similar to:

```bash
$ ./get_helm.sh -v 2.13.1
Helm 2.13.1 is available. Changing from version v2.17.0.
Downloading https://get.helm.sh/helm-2.13.1-darwin-amd64.tar.gz
SHA sum of /var/folders/9n/lb2q4q1d5xq89tst4vh_7_br0000gp/T/helm-installer-XXXXXX.Vu2ElWsi/helm-2.13.1-darwin-amd64.tar.gz does not match. Aborting.
Failed to install helm with the arguments provided: -v 2.13.1
Accepted cli arguments are:
	[--help|-h ] ->> prints this help
	[--version|-v <desired_version>]
	e.g. --version v2.4.0  or -v latest
	[--no-sudo]  ->> install without sudo
	For support, go to https://github.com/helm/helm.
```

That's it, that's the entire instructions. If you're interested in reproducing the "incompatible versions" error yourself, read on ahead.

## Reproducing the error

All the CLI output here is from a computer running macOS Catalina, so your output may vary.

First, check out "[Getting Started With minikube](/blog/getting-started-with-minikube)" to get `minikube` up and running on your system.

Then, we're going to install the old v2.13.1 version of Helm from above:

```bash
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get

$ chmod +x get_helm.sh

$ ./get_helm.sh -v v2.13.1
Downloading https://get.helm.sh/helm-v2.13.1-darwin-amd64.tar.gz
Verifying checksum... Done.
Preparing to install helm into /usr/local/bin
helm installed into /usr/local/bin/helm

$ helm version
Client: &version.Version{SemVer:"v2.13.1", GitCommit:"618447cbf203d147601b4b9bd7f8c37a5d39fbb4", GitTreeState:"clean"}
Error: could not find tiller
```

In order to install and use an old version of Tiller, we need to use an old version of Kubernetes with `minikube`:

```bash
$ minikube start --kubernetes-version=1.14.9
😄  minikube v1.14.2 on Darwin 10.15.7
✨  Automatically selected the docker driver
👍  Starting control plane node minikube in cluster minikube
🔥  Creating docker container (CPUs=2, Memory=7913MB) ...
🐳  Preparing Kubernetes v1.14.9 on Docker 19.03.8 ...
    > kubeadm.sha1: 41 B / 41 B [----------------------------] 100.00% ? p/s 0s
    > kubelet.sha1: 41 B / 41 B [----------------------------] 100.00% ? p/s 0s
    > kubectl.sha1: 41 B / 41 B [----------------------------] 100.00% ? p/s 0s
    > kubeadm: 37.77 MiB / 37.77 MiB [----------------] 100.00% 5.81 MiB p/s 6s
    > kubectl: 41.12 MiB / 41.12 MiB [----------------] 100.00% 4.70 MiB p/s 9s
    > kubelet: 122.17 MiB / 122.17 MiB [-------------] 100.00% 7.86 MiB p/s 15s
🔎  Verifying Kubernetes components...
🌟  Enabled addons: storage-provisioner, default-storageclass

❗  /usr/local/bin/kubectl is version 1.19.3, which may have incompatibilites with Kubernetes 1.14.9.
💡  Want kubectl v1.14.9? Try 'minikube kubectl -- get pods -A'
🏄  Done! kubectl is now configured to use "minikube" by default
```

Then using `helm`, we're going to install Tiller into our cluster:

```bash
$ helm init
Creating /Users/<username>/.helm
Creating /Users/<username>/.helm/repository
Creating /Users/<username>/.helm/repository/cache
Creating /Users/<username>/.helm/repository/local
Creating /Users/<username>/.helm/plugins
Creating /Users/<username>/.helm/starters
Creating /Users/<username>/.helm/cache/archive
Creating /Users/<username>/.helm/repository/repositories.yaml
Adding stable repo with URL: https://kubernetes-charts.storage.googleapis.com
Adding local repo with URL: http://127.0.0.1:8879/charts
$HELM_HOME has been configured at /Users/<username>/.helm.

Tiller (the Helm server-side component) has been installed into your Kubernetes Cluster.

Please note: by default, Tiller is deployed with an insecure 'allow unauthenticated users' policy.
To prevent this, run `helm init` with the --tiller-tls-verify flag.
For more information on securing your installation see: https://docs.helm.sh/using_helm/#securing-your-helm-installation
Happy Helming!
```

We can verify the version of Tiller in the cluster with `helm`:

```bash
$ helm version
Client: &version.Version{SemVer:"v2.13.1", GitCommit:"618447cbf203d147601b4b9bd7f8c37a5d39fbb4", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.13.1", GitCommit:"618447cbf203d147601b4b9bd7f8c37a5d39fbb4", GitTreeState:"clean"}
```

Then using a newer version of `helm` we can see the "incompatible versions" error:

```bash
$ ./get_helm.sh -v v2.14.0
Helm v2.14.0 is available. Changing from version v2.13.1.
Downloading https://get.helm.sh/helm-v2.14.0-darwin-amd64.tar.gz
Preparing to install helm and tiller into /usr/local/bin
helm installed into /usr/local/bin/helm
tiller installed into /usr/local/bin/tiller
Run 'helm init' to configure helm.

$ helm list
Error: incompatible versions client[v2.14.0] server[v2.13.1]
```

And if we switch our `helm` version to the Tiller version in cluster, it'll work again:

```bash
$ ./get_helm.sh -v v2.13.1
Helm v2.13.1 is available. Changing from version v2.14.0.
Downloading https://get.helm.sh/helm-v2.13.1-darwin-amd64.tar.gz
Preparing to install helm and tiller into /usr/local/bin
helm installed into /usr/local/bin/helm
tiller installed into /usr/local/bin/tiller
Run 'helm init' to configure helm.

$ helm list
(no output because we don't have any releases)
```
