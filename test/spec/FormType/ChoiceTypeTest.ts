///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import ServiceContainer = require('../../../src/Service/ServiceContainer');
import assert = require('assert');
import ChoiceType = require('../../../src/FormType/ChoiceType');
import sinon = require('sinon');
var jsdom:jsdom = require('mocha-jsdom');

describe('ChoiceType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
    ServiceContainer.HtmlEvents = require('../../Util/JQueryHtmlEvents');
  });

  describe('init', () => {
    it('should create an empty select element', () => {
      var $select:JQuery;
      var choiceType = new ChoiceType();

      choiceType.render();
      $select = $(choiceType.el).find('select');

      assert.equal($select.length, 1,
        'Expected a single select element to be rendered.');

      assert.equal($select.children().length, 0,
        'Expected select element to be empty.');
    });

    it('should create option elements for each choice', () => {
      var $select:JQuery, $options:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      choiceType.render();
      $select = $(choiceType.el).find('select');
      $options = $select.children('option');

      assert.equal($options.length, 2,
        'Expected option element to be created for each choice');

      // NOTE: these tests are fragile,
      //   as not all browsers may maintain object
      //   ordering they way you'd expect.
      assert.equal($options.eq(0).val(), 'us');
      assert.equal($options.eq(1).val(), 'ca');

      assert.equal($options.eq(0).text().trim(), 'United States');
      assert.equal($options.eq(1).text().trim(), 'Canada');
    });

    it('should select the specified option', () => {
      var $select:JQuery, $options:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          fr: 'France',
          ca: 'Canada'
        },
        data: 'fr'
      });

      choiceType.render();
      $select = $(choiceType.el).find('select');
      $options = $select.children('option');

      // NOTE: these tests are fragile,
      //   as not all browsers may maintain object
      //   ordering they way you'd expect.
      assert.equal($options.eq(1).val(), 'fr');
      assert(!$options.eq(0).prop('selected'), 'Expected `us` not be selected');
      assert($options.eq(1).prop('selected'), 'Expected `fr` to be selected');
      assert(!$options.eq(2).prop('selected'), 'Expected `ca` not to be selected');
    });
  });

  describe('close', () => {

    it('should remove the select and option views from the DOM', () => {
      var $scope:JQuery = $('<div></div>');
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      choiceType.render();
      $scope.append(choiceType.el);

      choiceType.close();

      assert.equal($scope.children().length, 0, 'Expect all views to be removed from the documents');
    });

  });

  describe('getData', () => {

    it('should return the initial data value, before rendering the type', () => {
      var choiceType = new ChoiceType({
        data: 'bar',
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      assert.equal(choiceType.getData(), 'bar');
    });

    it('should return the initial data value, after rendering the type', () => {
      var choiceType = new ChoiceType({
        data: 'bar',
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });

      choiceType.render();

      assert.equal(choiceType.getData(), 'bar');
    });

    it('should return null, if no data is provided', function() {
      var choiceType = new ChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });
      choiceType.render();

      assert.equal(choiceType.getData(), null);
    });

    it('should return changed values', function() {
      var $select:JQuery;
      var choiceType = new ChoiceType({
        data: 'foo',
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });


      $select = $(choiceType.el).find('select');
      $select.val('bar').trigger('change');

      assert.equal(choiceType.getData(), 'bar');
    });

  });

  describe('setData', () => {

    it('should set the value of the select element', () => {
      var select:HTMLSelectElement;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });


      choiceType.setData('chicken');

      select = <HTMLSelectElement>choiceType.getFormElement();
      assert.equal(select.value, 'chicken');
    });

    it('should set the return value of getData()', () => {
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });


      choiceType.setData('chicken');

      assert.equal(choiceType.getData(), 'chicken');
    });

    it('should select none for falsey data values', () => {
      var $options:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: null
      });


      $options = $(choiceType.el).find('options');

      assert(!$options.filter(':selected').length);
    });

    it('should work with numeric data', () => {
      var $select:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          100: 'one-hunny',
          200: 'two-hunny'
        },
        data: 200
      });


      $select = $(choiceType.getFormElement());

      assert($select.find('[value="200"]').is(':selected'));
    });

    it('should trigger a change event', () => {
      var onChange = sinon.spy();
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });

      choiceType.on('change', onChange);

      choiceType.setData('chicken');

      assert(onChange.called);
    });

    it('should not trigger a change event, if the data is the same', () => {
      var onChange = sinon.spy();
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });

      choiceType.on('change', onChange);

      choiceType.setData('egg');

      assert(!onChange.called);
    });

  });

  describe('change event', () => {

    it('should fire when the select input\'s value changes', (done) => {
      var onChange = sinon.spy();
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          fr: 'France',
          ca: 'Canada'
        },
        data: 'us'
      });

      choiceType.on('change', () => {
        onChange();
        done();
      });

      $(choiceType.getFormElement()).val('fr').trigger('change');
    });

  });

  describe('disableOption', () => {

    it('should disable an option element', () => {
      var $options:JQuery, $chickenOpt:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });


      choiceType.disableOption('chicken');

      $options = $(choiceType.getFormElement()).children();
      $chickenOpt = $options.filter('[value="chicken"]');

      // Check that chicken is disabled
      assert($chickenOpt.is(':disabled'));

      // egg should not be disabled
      assert(!$options.filter('[value="egg"]').is(':disabled'));
    });

    it('should unset a disabled option as the selected value', () => {
      var $select:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });


      choiceType.disableOption('egg');

      $select = $(choiceType.getFormElement());

      assert(!$select.children('[value="egg"]').is(':selected'), 'Egg should not be selected');
      assert($select.children('[value="egg"]').is(':disabled'), 'Egg should be disabled')
    });

  });

  describe('enableOption', () => {

    it('should re-enable a disabled option', () => {
      var $select:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });


      choiceType.disableOption('chicken');
      choiceType.enableOption('chicken');

      $select = $(choiceType.el);

      assert(!$select.find('[value="chicken"]').is(':disabled'));
    });

  });

  describe('setChoices', () => {

    it('should update rendered option element', () => {
      var $select:JQuery, $options:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          ca: 'Canada'
        }
      });

      choiceType.setChoices({
        pa: 'Panama',
        qa: 'Qatar'
      });

      $select = $(choiceType.el).find('select');
      $options = $select.children('option');

      assert.equal($options.length, 2);

      assert.equal($options.filter('[value=pa]').text().trim(), 'Panama');
      assert.equal($options.filter('[value=qa]').text().trim(), 'Qatar');
    });

  });

});