---

title: Installing a Specific Version of Helm on macOS
draft: true

---

```text
https://stackoverflow.com/questions/50701224/helm-incompatible-versions-between-client-and-server

brew uninstall helm || true
brew uninstall kubernetes-helm || true
brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/c3a105c41a8f8be942bf97554466af236c2fac72/Formula/kubernetes-helm.rb
brew switch kubernetes-helm 2.13.1
```
