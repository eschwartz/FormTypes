///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/mocha-jsdom/mocha-jsdom.d.ts"/>
///<reference path="../typings/jquery/jquery.d.ts"/>
import assert = require('assert');
import FormType = require('../src/FormType/FormType');
var jsdom:jsdom = require('mocha-jsdom');

describe('FormType', () => {
  var $:JQueryStatic;
  jsdom();

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

  });

});