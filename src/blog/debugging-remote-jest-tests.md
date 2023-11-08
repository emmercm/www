---

title: Debugging Remote Jest Tests
date: 2020-02-21T02:09:00
tags:
- node.js
- testing

---

I ran into the need to debug Jest tests running inside a Docker container recently and didn't find any clear instructions on how to do it. Turns out it's pretty easy when you have the right flags.

## Project setup

Let's walk through creating the files necessary to demonstrate the remote debugging.

### Node.js

Using the examples from Jest's "[Getting Started](https://jestjs.io/docs/en/getting-started)," create `sum.js`:

```javascript
function sum(a, b) {
    return a + b;
}
module.exports = sum;
```

and `sum.test.js`:

```javascript
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});
```

### Docker

Loosely following Node's "[Dockerizing a Node.js web app](https://web.archive.org/web/20231020185953/https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)," create `Dockerfile`:

```dockerfile
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

CMD [ "node", "sum.js" ]
```

and `.dockerignore`:

```text
node_modules
npm-debug.log
```

### npm

Fill out your `package.json` with the following scripts and dependencies:

```json
{
  "scripts": {
    "test": "jest",
    "test-debug": "node --inspect-brk=0.0.0.0 ./node_modules/jest/bin/jest.js",
    "test-watch": "jest --watchAll",
    "test-watch-debug": "node --inspect-brk=0.0.0.0 ./node_modules/jest/bin/jest.js --watchAll --runInBand"
  },
  "devDependencies": {
    "jest": "latest"
  }
}
```

Now let's walk through each of those debug commands.

#### `test-debug`

```bash
node --inspect-brk=0.0.0.0 ./node_modules/jest/bin/jest.js
```

To break down each part of the command:

- `node` is required in order to enable `--inspect-brk`. The `jest` command doesn't provide a way to turn on the inspector.
- `--inspect-brk` will wait for a remote debugger to attach before executing the code. We're having `node` wait because the test will likely execute too fast for us to attach to it. The `0.0.0.0` IP means bind to all interfaces which is required for Docker networking.
- `./node_modules/jest/bin/jest.js` runs Jest just like it would with the `jest` command.

#### `test-watch-debug`

```bash
node --inspect-brk=0.0.0.0 ./node_modules/jest/bin/jest.js --watchAll --runInBand
```

This adds two extra flags to Jest:

- `--watchAll` watches for file changes and re-runs all tests when something changes.
- `--runInBand` causes all tests to be run in the parent process rather than child processes. This is required for debugging the tests `--watchAll` runs after file changes.

### Directory tree

After creating those 5 files you will end up with the directory tree:

```text
.
├── .dockerignore
├── Dockerfile
├── package.json
├── sum.js
└── sum.test.js
```

## Running with Docker

First, build the container and tag it as `sum`:

```bash
docker build -t sum .
```

Then we'll walk through the different Docker commands that change depending on which testing command we want.

### `test-debug` in Docker

To run `test-debug` we have a fairly short command:

```bash
docker run -p 9229:9229 sum npm run test-debug
```

- `docker run` to run a command in an already built image.
- `-p 9229:9229` to map the remote port 9229 to the local port 9229. This is necessary to attach your IDE or browser to the remote `node` instance.
- `sum` being the name of our built image.
- `npm run test-debug` to run our test command.

This will start the container and wait for a debugger to be attached on port 9229, then execute the tests.

### `test-watch-debug` in Docker

The `--watchAll` flag for Jest requires some additional Docker flags:

```bash
docker run -it -v "$(pwd):/usr/src/app" -p 9229:9229 sum npm run test-watch-debug
```

- `-it` to be able to interact with the process, to control Jest.
- `-v "$(pwd):/usr/src/app"` to mount the local host directory in the container so that file changes are visible in the container.

Like `test-debug`, this will start the container and wait for a debugger to be attached on port 9229, then execute the tests, but then it also watches for file changes and re-runs all tests when something changes.

Try running this command, wait for tests to execute the first time, then change `sum.js` or `sum.test.js` and see what happens.

## Attaching a debugger

It would take too long to list out the instructions for each editor, so here are links to some popular ones:

- [Chrome DevTools 55+](https://web.archive.org/web/20231016133140/https://nodejs.org/en/docs/guides/debugging-getting-started#inspector-clients)
- [Visual Studio Code 1.10+](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [JetBrains WebStorm 2017.1+](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html)

Make sure to use `localhost` for the host and `9229` for the port.
