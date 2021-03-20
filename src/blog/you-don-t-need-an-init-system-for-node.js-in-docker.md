---

title: You Don't Need an Init System for Node.js in Docker
date: 2021-03-20T19:43:00
tags:
- docker
- node.js

---

But you do need to think about how your application handles exit signals.

## The misinformation

The current (Nov 2, 2020) version of the Docker and Node.js [best practices](https://github.com/nodejs/docker-node/blob/747216238b68525f68f176959b00af5968260b9c/docs/BestPractices.md) has some misinformation:

> Node.js was not designed to run as PID 1 which leads to unexpected behaviour when running inside of Docker. For example, a Node.js process running as PID 1 will not respond to `SIGINT` (`CTRL-C`) and similar signals.

Node.js _can_ respond to those signals, but numerous blog posts would have you believe otherwise.

Here's an example application:

```javascript
console.log('Starting ...');

// Trap CTRL-C
process.on('SIGINT', function (code) {
  console.log('SIGINT received');
  process.exit();
});

// Sleep long enough to test the signal
setTimeout(function() {
  console.log('Stopping');
}, 60 * 1000);
```

If you run that with `node index.js` and press `CTRL-C`, the expected log will print, and it will exit.

If you run it in the most stripped-down Dockerfile you can, it will still exhibit the same behavior:

```dockerfile
FROM node:lts

COPY index.js ./

CMD ["node", "index.js"]
```

So why do so many people say otherwise?

## `process.exit()` isn't graceful

The above example is watered down, because `process.exit()` isn't a graceful way to stop your application.

From the Node.js [documentation](https://nodejs.org/api/process.html#process_process_exit_code):

> Calling `process.exit()` will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully, including I/O operations to `process.stdout` and `process.stderr`.

Those asynchronous I/O operations could be network connections which won't be closed gracefully, possibly resulting in exceptions in connected clients.

So let's talk about one of the most common Node.js networking use cases.

## Express doesn't trap exit signals

I think this is the main reason people want to use an init system with Node.js, because running an Express server in Docker is such a common use case.

If we use the Express [hello world](https://expressjs.com/en/starter/hello-world.html) example for our application, it won't respond to `CTRL-C` and stop like we want:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

But we can trap `SIGINT` and gracefully close the server:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Stopping ...');
  server.close(() => {
    console.log('Stopped');
  });
});
```

Both `docker stop <container>` and `kubectl delete pod <name>` send a `SIGTERM` signal instead of `SIGINT`, so we'd also want to trap that:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const shutdown = () => {
  console.log('Stopping ...');
  server.close(() => {
    console.log('Stopped');
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

## `npm` doesn't forward signals

One piece of advice you'll find in articles suggesting you use an init system is to not use `npm start` as your Dockerfile `CMD`, and this still holds true - `npm` isn't an init system and it doesn't forward exit signals to the `node` process, so none of the handlers we wrote above will work.

You might be tricked by `npm` stopping the `node` process with `CTRL-C` in Docker, but that isn't the same as the `node` process responding to an exit signal gracefully.

## Conclusion

Every application is different, but for the majority of simple Node.js applications you likely don't need or want an init system, and that includes `npm`.
