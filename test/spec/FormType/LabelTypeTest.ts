///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import LabelType = require('../../../src/FormType/LabelType');
import sinon = require('sinon');
import DomEvents = require('../../Util/DomEvents');
var jsdom:jsdom = require('mocha-jsdom');

describe('LabelType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });


  describe('render', () => {

    it('should render an empty label element', () => {
      var $label:JQuery;
      var labelType = new LabelType();
      labelType.render();

      $label = $(labelType.el);

      assert.equal($label.length, 1);
      assert.equal($label.text().trim(), '');
    });

    it('should render a label element with text', () => {
      var $label:JQuery;
      var labelType = new LabelType({
        data: 'foo'
      });
      labelType.render();

      $label = $(labelType.el);

      assert.equal($label.length, 1);
      assert.equal($label.text().trim(), 'foo');
    });

  });

  describe('getData', () => {

    it('should return the label text', () => {
      var $label:JQuery;
      var labelType = new LabelType({
        data: 'foo'
      });
      labelType.render();

      $label = $(labelType.el);

      assert.equal(labelType.getData(), 'foo');

      $label.text('shazaam');
      assert.equal(labelType.getData(), 'shazaam');

      labelType.setData('kablooey');
      assert.equal(labelType.getData(), 'kablooey');
    });

  });

  describe('setData', () => {

    it('should set the label text', () => {
      var $label:JQuery;
      var labelType = new LabelType();
      labelType.render();

      labelType.setData('shazaam');

      $label = $(labelType.el);
      assert.equal($label.text(), 'shazaam');
    });

  });

});