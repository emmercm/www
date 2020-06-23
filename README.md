# [https://emmer.dev](https://emmer.dev)

## Dependencies

This website is built with [Node.js](https://nodejs.org), with the specific version managed by [`nvm`](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

and its dependencies are managed by [`npm`](https://www.npmjs.com/):

```bash
npm install
```

## Building

This website is built with [Node.js](https://nodejs.org):

```bash
node index
```

The resulting `build` directory contains the output, similar to:

```text
build
├── index.html
└── static
    ├── css
    │   └── styles.css
    ├── img
    └── js
        └── scripts.js
```

## Deploying

This website is set up to be hosted with [Netlify](https://www.netlify.com/). They have a very detailed [blog article](https://www.netlify.com/blog/2015/12/08/a-step-by-step-guide-metalsmith-on-netlify/) on how to get started with Metalsmith.
