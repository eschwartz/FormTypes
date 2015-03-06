///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import FormType = require('../../../src/FormType/FormType');
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

    it('should render an empty HTML form', () => {
      var formType = new FormType();
      var $form;

      formType.render();
      $form = $(formType.el);

      assert.equal($form.prop('tagName').toLowerCase(), 'form', 'Expected form element to exist');
      assert.equal($form.children().length, 0, 'Expected form to have no children');
    });

    it('should render child form types', () => {
      var $form:JQuery, $inputs:JQuery;
      var formType = new FormType({
        children: [
          new TextType({
            name: 'fooInput',
            data: 'foo'
          }),
          new TextType({
            name: 'barInput',
            data: 'bar'
          })
        ]
      });

      $form = $(formType.render().el);
      $inputs = $form.find('input');

      assert.equal($inputs.length, 2,
        'Expected 2 child inputs to be rendered');

      assert.equal($inputs.eq(0).attr('name'), 'fooInput');
      assert.equal($inputs.eq(1).attr('name'), 'barInput');

      assert.equal($inputs.eq(0).val(), 'foo');
      assert.equal($inputs.eq(1).val(), 'bar');
    });

  });

});