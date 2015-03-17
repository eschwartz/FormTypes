///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import _ = require('underscore');
import assert = require('assert');
import SubmitType = require('../../../src/FormType/SubmitType');
import GroupType = require('../../../src/FormType/GroupType');
import sinon = require('sinon');
import DomEvents = require('../../Util/DomEvents');
var jsdom:jsdom = require('mocha-jsdom');

describe('SubmitType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('render', () => {

    it('should render a submit button', () => {
      var submitEl:HTMLInputElement;
      var submitType = new SubmitType();
      submitType.render();

      submitEl = <HTMLInputElement>submitType.getFormElement();
      assert.equal(submitEl.tagName.toLowerCase(), 'input');
      assert.equal(submitEl.type, 'submit');
      assert.equal(submitEl.value, 'Submit');
    });

    it('should use the label option as the submit button text', () => {
      var submitEl:HTMLInputElement;
      var submitType = new SubmitType({
        label: 'Do it'
      });
      submitType.render();

      submitEl = <HTMLInputElement>submitType.getFormElement();

      assert.equal(submitEl.value, 'Do it');
    });

  });

  describe('integration', () => {

    it('should not add data properties to a GroupType (before render)', () => {
      var groupType = new GroupType({
        children: [
          new SubmitType({
            name: 'mySubmitType'
          })
        ]
      });
      var data = groupType.getData();

      assert(!data.hasOwnProperty('mySubmitType'));
    });

    it('should not add data properties to a GroupType (after render)', () => {
      var groupType = new GroupType({
        children: [
          new SubmitType({
            name: 'mySubmitType'
          })
        ]
      });
      var data;

      groupType.render();
      data = groupType.getData();

      assert(!data.hasOwnProperty('mySubmitType'));


    });

  });

});