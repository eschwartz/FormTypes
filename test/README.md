# Running test for FormTypes

## Node Environment

The tests for FormTypes are written using mochajs. The mocha binary will be located in your /node_modules/.bin directory.

Because I'm using `jsdom` to simulate an HTML DOM, **you will need to run tests using io.js**.

eg:

```
iojs ./node_modules/.bin/mocha ./test/FormTypeTest.js
```

If you're using PHPStorm, you can configure mochajs tests in the **Run/Debug Configuration**. Just make sure to specify `iojs` as your node environment.

All typescript files must be compiled to run mocha tests. To do this, you can run `grunt ts:build-tests`.


## Browser Environment

You may also want to run tests in the browser. To to this:

1. Run `grunt build-vendor`. This will a separate package in the build/ dir for vendor libraries. Unless your vendor dependencies change, you won't have to do this again. 
2. Run `grunt build-tests`. This will output a compiled test file into /test/tests.js.
3. Open test/index.html in your browser 
