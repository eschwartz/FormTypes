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

  describe('render', () => {

    it('should create checkboxes for each choice', () => {
      var $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      multiChoiceType.render();
      $checkboxes = $(multiChoiceType.el).find('input[type=checkbox]');

      assert.equal($checkboxes.length, 2,
        'Should have rendered 2 checkboxes');

      assert.equal($checkboxes.filter('[value="us"]').length, 1);
      assert.equal($checkboxes.filter('[value="ca"]').length, 1);
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

      multiChoiceType.render();
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

      multiChoiceType.render();
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

      choiceType.render();
      scope.appendChild(choiceType.el);

      choiceType.close();

      assert.equal($(scope).children().length, 0, 'Expect all views to be removed from the documents');
    });

  });

  describe('getData', () => {

    it('should return the initial data values, before rendering the type', () => {
      var choiceType = new MultiChoiceType({
        data: ['bar'],
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      assert(_.isEqual(choiceType.getData(), ['bar']));
    });

    it('should return the initial data values, after rendering the type', () => {
      var choiceType = new MultiChoiceType({
        data: ['bar'],
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      choiceType.render();

      assert(_.isEqual(choiceType.getData(), ['bar']));
    });

    it('should return an empty array, if no data is provided', () => {
      var choiceType = new MultiChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      choiceType.render();

      assert(_.isEqual(choiceType.getData(), []));
    });

    it('should return the values of the checkboxes, after being checked', () => {
      var choiceType = new MultiChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      choiceType.render();

      $(choiceType.el).
        find('input[value="bar"]').
        attr('checked', 'true');

      assert(_.isEqual(choiceType.getData(), ['bar']));
    });

  });

  describe('setData', () => {

    it('should update which checkboxes are selected - setData called before render', () => {
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

      multiChoiceType.render();
      $scope = $(multiChoiceType.el);

      assert($scope.find('[value="us"]').is(':checked'), 'US should be checked');
      assert(!$scope.find('[value="ca"]').is(':checked'), 'CA should not be checked');
      assert($scope.find('[value="fr"]').is(':checked'), 'FR should be checked');
    });

    it('should update which checkboxes are selected - setData called after render', () => {
      var $scope:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });
      multiChoiceType.render();

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
      multiChoiceType.render();

      multiChoiceType.setData(['us', 'fr']);


      assert(_.isEqual(multiChoiceType.getData(), ['us', 'fr']));
    });

    it('should update the return value of getData() - before render', () => {
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        },
        data: ['us', 'ca']
      });

      multiChoiceType.setData(['us', 'fr']);

      multiChoiceType.render();

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
      multiChoiceType.render();

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
      multiChoiceType.render();
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
      multiChoiceType.render();
      multiChoiceType.on('change', () => onChange());

      multiChoiceType.setData(['us', 'ca']);

      assert(!onChange.called);
    });

  });

  describe('setChoices', () => {

    it('should update rendered option elements (before render)', () => {
      var $scope:JQuery, $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        }
      });

      multiChoiceType.setChoices({
        pa: 'Panama',
        qa: 'Qatar'
      });

      multiChoiceType.render();

      $scope = $(multiChoiceType.el);
      $checkboxes = $scope.find('[type="checkbox"]');

      assert.equal($checkboxes.length, 2);

      assert.equal($checkboxes.filter('[value=pa]').length, 1);
      assert.equal($checkboxes.filter('[value=qa]').length, 1);
    });

    it('should update rendered option elements (after render)', () => {
      var $scope:JQuery, $checkboxes:JQuery;
      var multiChoiceType = new MultiChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada',
          fr: 'France'
        }
      });

      multiChoiceType.render();

      multiChoiceType.setChoices({
        pa: 'Panama',
        qa: 'Qatar'
      });

      $scope = $(multiChoiceType.el);
      $checkboxes = $scope.find('[type="checkbox"]');

      assert.equal($checkboxes.length, 2);

      assert.equal($checkboxes.filter('[value=pa]').length, 1);
      assert.equal($checkboxes.filter('[value=qa]').length, 1);
    });

  });

});