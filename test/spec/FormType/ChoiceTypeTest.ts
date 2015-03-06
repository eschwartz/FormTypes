///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import ChoiceType = require('../../../src/FormType/ChoiceType');
var jsdom:jsdom = require('mocha-jsdom');

describe('ChoiceType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

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