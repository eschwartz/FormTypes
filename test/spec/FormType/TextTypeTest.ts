///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import TextType = require('../../../src/FormType/TextType');
import sinon = require('sinon');
var jsdom:jsdom = require('mocha-jsdom');

describe('TextType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('init', () => {

    it('should render a text input', () => {
      var textType = new TextType();
      var $inputForm:JQuery, $input:JQuery;

      $inputForm = $(textType.el);
      $input = $inputForm.find('input');

      assert.equal($input.length, 1,
        'Expected a single input element to exist');
      assert.equal($input.attr('type'), 'text', 'Expect input to be of type "text"');
    });

    it('should render the TextType\'s data as the input\'s value', () => {
      var $input:JQuery;
      var textType = new TextType({
        data: 'foobar'
      });

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

      $input = $(textType.el).find('input');

      assert.equal($input.attr('placeholder'), 'Enter stuff here...',
        'Expected `placeholder` attribute to be set.');
      assert($input.attr('required'),
        'Expected `required` attribute to be set.');
    });

    it('should render a label for the input', () => {
      var textType = new TextType();

      assert.equal($(textType.el).find('label').length, 1,
        'Expected a single label to be rendered.');
    });

    it('should use the label option as the label text', () => {
      var $label:JQuery;
      var textType = new TextType({
        label: 'My Great Text Input'
      });

      $label = $(textType.el).find('label');

      assert.equal($label.text().trim(), 'My Great Text Input',
        'Expected label text to match label option.');
    });

    it('should use the camelCased name option to generate a default label', () => {
      var $label:JQuery;
      var textType = new TextType({
        name: 'userName'
      });

      $label = $(textType.el).find('label');

      assert.equal($label.text().trim(), 'User Name',
        'Expected label text to match label option.');
    });

    it('should use a shared uid for the input id and the label[for] attribute', () => {
      var $input:JQuery, $label:JQuery;
      var textType = new TextType({
        name: 'userName'
      });

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

      $label = $(textType.el).find('label');

      assert.equal($label.attr('class'), 'foo-bar faz-baz',
        'Expected label to have attributes from `labelAttrs` option.');
    });

    it('should render without a label', () => {
      var textType = new TextType({
        label: false
      });

      assert.equal($(textType.el).find('label').length, 0);
    });

  });

  describe('getData', () => {

    it('should return the initial data value', () => {
      var textType = new TextType({
        data: 'foo'
      });

      assert.equal(textType.getData(), 'foo');
    });

    it('should return an empty string, if no data is provided', function() {
      var textType = new TextType();

      assert.strictEqual(textType.getData(), '');
    });

    it('should return changed values', function() {
      var $input:JQuery;
      var textType = new TextType({
        data: 'foo'
      });

      $input = $(textType.el).find('input');
      $input.val('bar').trigger('input');

      assert.equal(textType.getData(), 'bar');
    });

  });

  describe('setData', () => {

    it('should set the value of the input element', () => {
      var input:HTMLInputElement;
      var textType = new TextType();

      textType.setData('foo');

      input = <HTMLInputElement>textType.getFormElement();
      assert.equal(input.value, 'foo');
    });

    it('should set the return value of getData()', () => {
      var textType = new TextType();

      textType.setData('foo');

      assert.equal(textType.getData(), 'foo');
    });


    it('should set the value of the input element', () => {
      var input:HTMLInputElement;
      var textType = new TextType();
      textType.setData('foo');

      input = <HTMLInputElement>textType.getFormElement();
      assert.equal(input.value, 'foo');
    });

    it('should trigger a change event', () => {
      var onChange = sinon.spy();
      var textType = new TextType();

      textType.on('change', onChange);

      textType.setData('foo');

      assert(onChange.called);
    });

    it('should not trigger a change event, if the data is not changed', () => {
      var onChange = sinon.spy();
      var textType = new TextType({
        data: 'foo'
      });

      textType.on('change', onChange);

      textType.setData('foo');

      assert(!onChange.called);
    });

  });

  describe('`change` event', () => {

    it('should fire after the input\'s value has changed', (done) => {
      var onChange = sinon.spy();
      var textType = new TextType();


      textType.on('change', () => {
        onChange();
        done();
      });

      $(textType.getFormElement()).val('foo').trigger('input');
    });

  });

});