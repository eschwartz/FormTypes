# Running test for FormTypes

The tests for FormTypes are written using mochajs. The mocha binary will be located in your /node_modules/.bin directory.

Because I'm using `jsdom` to simulate an HTML DOM, **you will need to run tests using io.js**.

eg:

```
iojs ./node_modules/.bin/mocha ./test/FormTypeTest.js
```

If you're using PHPStorm, you can configure mochajs tests in the **Run/Debug Configuration**. Just make sure to specify `iojs` as your node environment.