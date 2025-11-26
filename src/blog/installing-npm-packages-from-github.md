---

title: Installing npm Packages From GitHub
date: 2023-02-23T23:36:00
tags:
- github
- node.js

---

Installing packages from GitHub is a great way to test them before publishing.

If you publish some public npm packages that you make use of in other projects, it can be helpful to exercise them in a real-world scenario before publishing them. Recently I ran into an issue where a Metalsmith plugin of mine [stopped working](https://github.com/emmercm/metalsmith-plugins/pull/15) in my website build, but was passing all of its unit tests. I wanted to make sure that any fix I released actually fixed the problem so that I didn't publish another broken version.

Depending on where the `package.json` is located in the package you're trying to install, there are two different solutions.

## 1. `package.json` is at the repository root

If the npm package's `package.json` is at the root of the GitHub repository, `npm` can handle it out of the box.

Installing a specific branch (e.g. from a pull request):

```shell
$ npm install "git+https://github.com/<user>/<repo>#<branch>"

$ npm install "git+https://github.com/isaacs/rimraf#v3"
```

or a specific commit hash:

```shell
$ npm install "git+https://github.com/<user>/<repo>#<commit>"

$ npm install "git+https://github.com/isaacs/rimraf#df3d085"
```

If you already had a package of the same name installed, it will be overwritten with this new source. After your testing you will need to revert your `package.json` and lockfile if you use one.

## 2. `package.json` is in a subdirectory

If the npm package's `package.json` is in a subdirectory, such as in a [Lerna](https://lerna.js.org/) monorepo, then `npm` can't handle it natively. Thankfully, there is a website [GitPkg](https://gitpkg.vercel.app/) that can help.

Installing a specific branch (e.g. from a pull request):

```shell
$ npm install "https://gitpkg.now.sh/<user>/<repo>/<directory>?<branch>"

$ npm install "https://gitpkg.now.sh/emmercm/metalsmith-plugins/packages/metalsmith-mermaid?emmercm/mermaid-cli"
```

or a specific commit hash:

```shell
$ npm install "https://gitpkg.now.sh/<user>/<repo>/<directory>?0ee2958"

$ npm install "https://gitpkg.now.sh/emmercm/metalsmith-plugins/packages/metalsmith-mermaid?8e21383"
```

## Bash function

Here's a bash function from [my dotfiles](https://github.com/emmercm/dotfiles) you can put into your `~/.bashrc`, `~/.zshrc`, or whatever is appropriate for your shell:

```bash
# Install a package from GitHub
# @param {string} $1 GitHub "<user>/<repo>", e.g. emmercm/metalsmith-plugins
# @param {string} $2 Branch name or commit hash
# @param {string=} $3 Package subdirectory
# @example ngit isaacs/rimraf v3
# @example ngit emmercm/metalsmith-plugins 8e21383 packages/metalsmith-mermaid
ngit() {
  local user_repo=$(echo "$1" | sed 's#^[a-z]*://[a-z.]*/\([^/]*/[^/]*\).*#\1#i')
  if [[ "${3:-}" == "" ]]; then
    npm install "git+https://github.com/${user_repo}#$2"
  else
    npm install "https://gitpkg.now.sh/${user_repo}/$3?$2"
  fi
}
```
