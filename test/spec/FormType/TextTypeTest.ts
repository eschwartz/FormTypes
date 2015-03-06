///ts:ref=mocha.d.ts
/// <reference path="../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import TextType = require('../../../src/FormType/TextType');
var jsdom:jsdom = require('mocha-jsdom');

describe('FormType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('render', () => {

    it('should render a text input', () => {
      var formType = new FormType();
      var $form;

      formType.render();
      $form = $(formType.el);

      assert.equal($form.prop('tagName').toLowerCase(), 'form', 'Expected form element to exist');
      assert.equal($form.children().length, 0, 'Expected form to have no children');
    });

  });

});