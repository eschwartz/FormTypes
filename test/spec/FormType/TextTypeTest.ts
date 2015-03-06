///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
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
    });

    it('should use a shared uid for the input id and the label[for] attribute', () => {
    });

    it('should render label attributes', () => {
    });

  });

});