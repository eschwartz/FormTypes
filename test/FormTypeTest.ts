///<reference path="../typings/ref.d.ts"/>
import assert = require('assert');
import FormType = require('../src/FormType');
var jsdom:jsdom = require('mocha-jsdom');

describe('FormType', () => {
  var $;
  jsdom();

  before(() => {
    $:$ = require('jquery');
  });

  describe('render', () => {

    it('should render an empty HTML form', () => {
      var formType = new FormType();
      var $form = $(formType.render());

      assert.equal(1, $form.find('form').length, 'Expected form element to exist');
      assert.equal(0, $form.children().length, 'Expected form to have no children');
    });

  });

});