///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import ChoiceType = require('../../../src/FormType/ChoiceType');
import sinon = require('sinon');
import DomEvents = require('../../Util/DomEvents');
var jsdom:jsdom = require('mocha-jsdom');

describe('ChoiceType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('render', () => {
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

    it('should return the value of the first choice element, if no data is provided', function() {
      var choiceType = new ChoiceType({
        choices: {
          foo: 'Foo',
          bar: 'Bar'
        }
      });
      choiceType.render();

      assert.equal(choiceType.getData(), 'foo');
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
      choiceType.render();

      $select = $(choiceType.el).find('select');
      $select.val('bar');

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
      choiceType.render();

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
      choiceType.render();

      choiceType.setData('chicken');

      assert.equal(choiceType.getData(), 'chicken');
    });

    it('should set the return value of getData() - before render', () => {
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

    it('should set the eventual rendered value of the select element - before render', () => {
      var $select:JQuery, $options:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });

      choiceType.setData('chicken');
      choiceType.render();

      $select = $(choiceType.getFormElement());
      $options = $select.find('option');

      assert.equal($select.val(), 'chicken');
      assert.equal($options.filter(':selected').val(), 'chicken');
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
      choiceType.render();

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
      choiceType.render();

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
      var select:HTMLSelectElement;
      var onChange = sinon.spy();
      var choiceType = new ChoiceType({
        choices: {
          us: 'United States',
          fr: 'France',
          ca: 'Canada'
        },
        data: 'us'
      });
      choiceType.render();
      select = <HTMLSelectElement>choiceType.getFormElement();

      choiceType.on('change', () => {
        assert.equal(select.value, 'fr');
        onChange();
        done();
      });

      DomEvents.dispatchChangeEvent(select, 'fr');
    });

  });

  describe('disableOption', () => {

    it('should disabled an option element', () => {
      var $options:JQuery, $chickenOpt:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });
      choiceType.render();

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
      choiceType.render();

      choiceType.disableOption('egg');

      $select = $(choiceType.getFormElement());

      assert(!$select.children('[value="egg"]').is(':selected'));
    });

    it('before render - should disable once rendered', () => {
      var $options:JQuery, $chickenOpt:JQuery;
      var choiceType = new ChoiceType({
        choices: {
          chicken: 'The Chicken',
          egg: 'The Egg'
        },
        data: 'egg'
      });

      choiceType.disableOption('chicken');

      choiceType.render();
      $options = $(choiceType.getFormElement()).children();
      $chickenOpt = $options.filter('[value="chicken"]');

      // Check that chicken is disabled
      assert($chickenOpt.is(':disabled'));

      // egg should not be disabled
      assert(!$options.filter('[value="egg"]').is(':disabled'));
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
      choiceType.render();

      choiceType.disableOption('chicken');
      choiceType.enableOption('chicken');

      $select = $(choiceType.el);

      assert(!$select.find('[value="chicken"]').is(':disabled'));
    });

  });

});