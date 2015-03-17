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
///ts:import=HtmlEventsInterface.ts
import HtmlEventsInterface = require('../../../src/Util/HtmlEventsInterface'); ///ts:import:generated
import _ = require('underscore');
import assert = require('assert');
import SubmitType = require('../../../src/FormType/SubmitType');
import GroupType = require('../../../src/FormType/GroupType');
import FormType = require('../../../src/FormType/FormType');
import sinon = require('sinon');
var jsdom:jsdom = require('mocha-jsdom');
var JQueryHtmlEvents:HtmlEventsInterface;

describe('SubmitType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
    JQueryHtmlEvents = require('../../Util/JQueryHtmlEvents');
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

  describe('`submit` event', () => {

    it('should fire when the button is clicked', () => {
      var $submitBtn:JQuery;
      var onClick = sinon.spy();
      var submitType = new SubmitType({
        label: 'Do it'
      });
      submitType.setHtmlEvents(JQueryHtmlEvents);
      submitType.render();

      submitType.on('submit', onClick);

      $submitBtn = $(submitType.getFormElement());
      $submitBtn.click();

      assert(onClick.called, 'Expected `submit` event handler to have been called');
    });

  });

  describe('integration', () => {

    it('should fire a submit event on a parent FormType', () => {
      var submitType:SubmitType;
      var onSubmit = sinon.spy();
      var formType = new FormType({
        children: [
          submitType = new SubmitType()
        ]
      });
      formType.render();

      formType.on('submit', onSubmit);
      $(submitType.getFormElement()).click();

      assert(onSubmit.called, 'Expected onSubmit listener to have been called.');
    });

    it('should fire a submit event on a parent FormType (nested)', () => {
      var submitType:SubmitType;
      var onSubmit = sinon.spy();
      var formType = new FormType({
        children: [
          new GroupType({
            children: [
              submitType = new SubmitType()
            ]
          })
        ]
      });
      formType.render();

      formType.on('submit', onSubmit);
      $(submitType.getFormElement()).click();

      assert(onSubmit.called, 'Expected onSubmit listener to have been called.');
    });

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