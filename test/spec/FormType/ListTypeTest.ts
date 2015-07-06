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
import ListType = require('../../../src/FormType/ListType');
import AbstractFormType = require('../../../src/FormType/AbstractFormType');
import TextType = require('../../../src/FormType/TextType');
import sinon = require('sinon');
import DomEvents = require('../../Util/DomEvents');
var jsdom:jsdom = require('mocha-jsdom');

describe('ListType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('initialization', function () {

    it('should create children of the ItemType', () => {
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      var children = listType.getChildren();

      assert.equal(children.length, 2);
      assert(children[0] instanceof TextType);
      assert(children[1] instanceof TextType);
    });

  });

  describe('init', () => {

    it('should render an empty list', () => {
      var listType = new ListType();

      assert.equal(listType.el.tagName.toLowerCase(), 'ul');
      assert.equal(listType.el.childNodes.length, 0);
    });

    it('should render a list of form types', () => {
      var $list:JQuery, $items:JQuery, $inputs;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      assert.equal($items.length, 2);
      assert.equal($items.prop('tagName').toLowerCase(), 'li');

      assert.equal($inputs.length, 2);
      assert.equal($inputs.prop('tagName').toLowerCase(), 'input');

      assert.equal($inputs.eq(0).val().trim(), 'foo');
      assert.equal($inputs.eq(1).val().trim(), 'bar');
    });

  });

  describe('getData', () => {

    it('should return initial data', () => {
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      assert(_.isEqual(listType.getData(), ['foo', 'bar']));
    });

    it('should get modified data for each child type', () => {
      var $list:JQuery, $items:JQuery, $inputs;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      // Modify a child type object
      listType.getChildren()[0].setData('shazaam');

      // Modify a child's form element
      $inputs.eq(1).val('kablooey').trigger('input');

      assert(_.isEqual(listType.getData(), ['shazaam', 'kablooey']));
    });

  });

  describe('setData', () => {

    it('should update the child form elements', () => {
      var $list:JQuery, $items:JQuery, $inputs;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      listType.setData(['shazaam', 'kablooey']);

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');


      assert.equal($inputs.eq(0).val(), 'shazaam');
      assert.equal($inputs.eq(1).val(), 'kablooey');
    });

  });

  describe('addData', () => {

    it('should add a new list item', () => {
      var $list:JQuery, $items:JQuery, $inputs:JQuery;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      listType.addData('shazaam');

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      assert.equal($items.length, 3);
      assert.equal($inputs.eq(2).val().trim(), 'shazaam');
    });

    it('should trigger a change event', function() {
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });
      var onChange = sinon.spy();

      listType.on('change', onChange);

      listType.addData('shazaam');

      assert.equal(onChange.callCount, 1);
    });

  });

  describe('removeData', function() {

    it('should remove a list item', () => {
      var $list:JQuery, $items:JQuery, $inputs:JQuery;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar',
          'shazaam'
        ]
      });

      listType.removeData('bar');

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      assert.equal($items.length, 2);
      assert.equal($inputs.eq(0).val().trim(), 'foo');
      assert.equal($inputs.eq(1).val().trim(), 'shazaam');
    });

  });

  describe('removeChild', () => {

    it('should remove a child element', () => {
      var $list:JQuery, $items:JQuery, $inputs:JQuery;
      var fooItem:TextType;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      fooItem = <TextType>listType.getChildren()[1];
      listType.removeChild(fooItem);

      $list = $(listType.el);
      $items = $list.find('li');
      $inputs = $items.find('input');

      assert.equal($items.length, 1);
      assert.equal($inputs.eq(0).val().trim(), 'foo');
    });

  });

  describe('on child close', () => {

    it('should remove the child view', () => {
      var $list:JQuery, $items:JQuery, $inputs;
      var fooChild:AbstractFormType;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ]
      });

      fooChild = listType.getChildren()[0];
      fooChild.close();

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      assert.equal($items.length, 1);
      assert.equal($inputs.eq(0).val(), 'bar');
    });

    it('should remove the child view, when the list view is nested', () => {
      var $list:JQuery, $items:JQuery, $inputs;
      var fooChild:AbstractFormType;
      var listType = new ListType({
        ItemType: TextType,
        data: [
          'foo',
          'bar'
        ],
        template: () => '\
<div>\
  <ul></ul>\
</div>\
        '
      });

      fooChild = listType.getChildren()[0];
      fooChild.close();

      $list = $(listType.el);
      $items = $list.children();
      $inputs = $items.find('input');

      assert.equal($items.length, 1);
      assert.equal($inputs.eq(0).val(), 'bar');
    });

  });

});