///ts:ref=mocha.d.ts
/// <reference path="../../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import DomEvents = require('../../../Util/DomEvents');
import assert = require('assert');
import sinon = require('sinon');

describe('DomEvents', () => {

  describe('dispatchInputEvent', () => {

    it('should simulate input events', () => {
      var onInput = sinon.spy();
      var input = document.createElement('input');

      input.addEventListener('input', () => {
        assert.equal(input.value, 'foo');
        onInput();
      });

      DomEvents.dispatchInputEvent(input, 'foo');

      assert(onInput.called);
    });

  });

});
