///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import MultiChoiceType = require('../../../src/FormType/MultiChoiceType');
import sinon = require('sinon');
import DomEvents = require('../../Util/DomEvents');
import _ = require('underscore');
var jsdom:jsdom = require('mocha-jsdom');

describe('MultiChoiceType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('init', () => {

    it('should create checkboxes for each choice', () => {
      var $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      $checkboxes = $(multiChoiceType.el).find('input[type=checkbox]');

      assert.equal($checkboxes.length, 2,
        'Should have rendered 2 checkboxes');

      assert.equal($checkboxes.filter('[value="us"]').length, 1);
      assert.equal($checkboxes.filter('[value="ca"]').length, 1);
    });

    it('should set the name of the checkbox to the data value', () => {
      var $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });


      $checkboxes = $(multiChoiceType.el).find('input[type=checkbox]');

      assert.equal($checkboxes.filter('[name="us"]').length, 1);
      assert.equal($checkboxes.filter('[name="ca"]').length, 1);
    });

    it('should render labels for each checkbox', () => {
      var $checkboxes:JQuery, $scope:JQuery
      var $usLabel:JQuery, $caLabel:JQuery;
      var usCheckboxId:string, caCheckboxId:string;

      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });


      $scope = $(multiChoiceType.el);
      $checkboxes = $scope.find('input[type=checkbox]');

      usCheckboxId = $checkboxes.filter('[value="us"]').attr('id');
      caCheckboxId = $checkboxes.filter('[value="ca"]').attr('id');

      $usLabel = $scope.find('label[for="' + usCheckboxId + '"]');
      $caLabel = $scope.find('label[for="' + caCheckboxId + '"]');
      assert.equal($usLabel.length, 1, 'Should have a label for the US checkbox');
      assert.equal($caLabel.length, 1, 'Should have a label for the Canada checkbox');

      assert.equal($usLabel.text().trim(), 'United States');
      assert.equal($caLabel.text().trim(), 'Canada');
    });

    it('should select the options specified in `data`', () => {
      var $checkboxes:JQuery, $scope:JQuery;

      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'fr']
      });

      $scope = $(multiChoiceType.el);
      $checkboxes = $scope.find('input[type=checkbox]');

      assert($checkboxes.filter('[value="us"]').is(':checked'), 'Expected US checkbox to be checked');
      assert(!$checkboxes.filter('[value="ca"]').is(':checked'), 'Expected CA checkbox not to be checked');
      assert($checkboxes.filter('[value="fr"]').is(':checked'), 'Expected FR checkbox to be checked');
    });

  });

  describe('close', () => {

    it('should remote the form view and children from the DOM', () => {
      var scope = document.createElement('div');
      var choiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      scope.appendChild(choiceType.el);

      choiceType.close();

      assert.equal($(scope).children().length, 0, 'Expect all views to be removed from the documents');
    });

  });

  describe('getData', () => {

    it('should return the initial data values', () => {
      var choiceType = new MultiChoiceType({
        data: ['bar'],
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      assert(_.isEqual(choiceType.getData(), ['bar']));
    });

    it('should return an empty array, if no data is provided', () => {
      var choiceType = new MultiChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      assert(_.isEqual(choiceType.getData(), []));
    });

    it('should return the values of the checkboxes, after being checked', () => {
      var choiceType = new MultiChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      $(choiceType.el).
        find('input[value="bar"]').
        prop('checked', true).
        trigger('change');

      assert(_.isEqual(choiceType.getData(), ['bar']));
    });

  });

  describe('setData', () => {

    it('should update which checkboxes are selected', () => {
      var $scope:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });


      multiChoiceType.setData(['us', 'fr']);

      $scope = $(multiChoiceType.el);

      assert($scope.find('[value="us"]').is(':checked'), 'US should be checked');
      assert(!$scope.find('[value="ca"]').is(':checked'), 'CA should not be checked');
      assert($scope.find('[value="fr"]').is(':checked'), 'FR should be checked');
    });

    it('should update the return value of getData()', () => {
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });


      multiChoiceType.setData(['us', 'fr']);


      assert(_.isEqual(multiChoiceType.getData(), ['us', 'fr']));
    });

    it('should select none for an empty array', () => {
      var $scope:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });


      multiChoiceType.setData([]);

      $scope = $(multiChoiceType.el);

      assert(!$scope.find('[value="us"]').is(':checked'), 'US should be checked');
      assert(!$scope.find('[value="ca"]').is(':checked'), 'CA should not be checked');
      assert(!$scope.find('[value="fr"]').is(':checked'), 'FR should be checked');
    });

    it('should trigger a change event', () => {
      var onChange = sinon.spy();
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });

      multiChoiceType.on('change', () => onChange());

      multiChoiceType.setData(['us', 'fr']);

      assert(onChange.called);
    });

    it('should not trigger a change event if the data is the same', () => {
      var onChange = sinon.spy();
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });

      multiChoiceType.on('change', () => onChange());

      multiChoiceType.setData(['us', 'ca']);

      assert(!onChange.called);
    });

  });

  describe('events', () => {

    it('should fire a change event when a checkbox is checked', () => {
      var onChange = sinon.spy();
      var onChangeUs = sinon.spy();
      var $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });


      $checkboxes = $(multiChoiceType.el).find('input[type=checkbox]');

      multiChoiceType.on('change', onChange);
      multiChoiceType.on('change:us', onChangeUs);

      $checkboxes.filter('[name=us]').click().trigger('change');
      assert($checkboxes.filter('[name=us]').is(':checked'), 'just making sure the US checkbox is checked...');

      assert(onChange.called, 'Should have triggered change event');
      assert(onChangeUs.called, 'Should have triggered change:us event');
    });

    it('should fire a change event when a checkbox is unchecked', () => {
      var onChange = sinon.spy();
      var onChangeUs = sinon.spy();
      var $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        },
        data: ['us']
      });

      $checkboxes = $(multiChoiceType.el).find('input[type=checkbox]');

      multiChoiceType.on('change', onChange);
      multiChoiceType.on('change:us', onChangeUs);

      $checkboxes.filter('[name=us]').click().trigger('change');
      assert(!$checkboxes.filter('[name=us]').is(':checked'), 'just making sure the US checkbox is not checked...');

      assert(onChange.called, 'Should have triggered change event');
      assert(onChangeUs.called, 'Should have triggered change:us event');
    });

  });

});