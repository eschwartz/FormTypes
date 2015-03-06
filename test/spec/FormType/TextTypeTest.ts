///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import TextType = require('../../../src/FormType/TextType');
var jsdom:jsdom = require('mocha-jsdom');

describe('TextType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('render', () => {

    it('should render a text input', () => {
      var textType = new TextType();
      var $inputForm:JQuery, $input:JQuery;

      textType.render();
      $inputForm = $(textType.el);
      $input = $inputForm.find('input');

      assert.equal($input.length, 1,
        'Expected a single input element to exist');
    });

    it('should render the TextType\'s data as the input\'s value', () => {
      var $input:JQuery;
      var textType = new TextType({
        data: 'foobar'
      });

      textType.render();
      $input = $(textType.el).find('input');

      assert.equal($input.val(), 'foobar');
    });

    it('should render attributes on the input', () => {
      var $input:JQuery;
      var textType = new TextType({
        attrs: {
          placeholder: 'Enter stuff here...',
          required: true
        }
      });

      $input = $(textType.render().el).find('input');

      assert.equal($input.attr('placeholder'), 'Enter stuff here...',
        'Expected `placeholder` attribute to be set.');
      assert($input.attr('required'),
        'Expected `required` attribute to be set.');
    });

    it('should render a label for the input', () => {
      var textType = new TextType();

      textType.render();

      assert.equal($(textType.el).find('label').length, 1,
        'Expected a single label to be rendered.');
    });

    it('should use the label option as the label text', () => {
      var $label:JQuery;
      var textType = new TextType({
        label: 'My Great Text Input'
      });

      textType.render();
      $label = $(textType.el).find('label');

      assert.equal($label.text().trim(), 'My Great Text Input',
        'Expected label text to match label option.');
    });

    it('should use the camelCased name option to generate a default label', () => {
      var $label:JQuery;
      var textType = new TextType({
        name: 'userName'
      });

      textType.render();
      $label = $(textType.el).find('label');

      assert.equal($label.text().trim(), 'User Name',
        'Expected label text to match label option.');
    });

    it('should use a shared uid for the input id and the label[for] attribute', () => {
      var $input:JQuery, $label:JQuery;
      var textType = new TextType({
        name: 'userName'
      });

      textType.render();
      $label = $(textType.el).find('label');
      $input = $(textType.el).find('input');

      assert($label.attr('for'), 'Expected label to have a `for` attribute');
      assert($input.attr('id'), 'Expected input to have an `id` attribute');

      assert.equal($label.attr('for'), $input.attr('id'),
        'Expected label `for` attribute to match input\'s id');
    });

    it('should render label attributes', () => {
      var $label:JQuery;
      var textType = new TextType({
        labelAttrs: {
          'class': 'foo-bar faz-baz'
        }
      });

      textType.render();
      $label = $(textType.el).find('label');

      assert.equal($label.attr('class'), 'foo-bar faz-baz',
        'Expected label to have attributes from `labelAttrs` option.');
    });

  });

});