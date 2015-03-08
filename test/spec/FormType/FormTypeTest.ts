///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import FormType = require('../../../src/FormType/FormType');
import TextType = require('../../../src/FormType/TextType');
import ChoiceType = require('../../../src/FormType/ChoiceType');
import _ = require('underscore');
import DomEvents = require('../../Util/DomEvents');
import sinon = require('sinon');
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

    it('should render an empty HTML form', () => {
      var formType = new FormType();
      var $form;

      formType.render();
      $form = $(formType.el);

      assert.equal($form.prop('tagName').toLowerCase(), 'form', 'Expected form element to exist');
      assert.equal($form.children().length, 0, 'Expected form to have no children');
    });

    it('should render child form types', () => {
      var $form:JQuery, $inputs:JQuery;
      var formType = new FormType({
        children: [
          new TextType({
            name: 'fooInput',
            data: 'foo'
          }),
          new TextType({
            name: 'barInput',
            data: 'bar'
          })
        ]
      });

      $form = $(formType.render().el);
      $inputs = $form.find('input');

      assert.equal($inputs.length, 2,
        'Expected 2 child inputs to be rendered');

      assert.equal($inputs.eq(0).attr('name'), 'fooInput');
      assert.equal($inputs.eq(1).attr('name'), 'barInput');

      assert.equal($inputs.eq(0).val(), 'foo');
      assert.equal($inputs.eq(1).val(), 'bar');
    });

  });

  describe('getData', () => {

    describe('before render', () => {



    });

    describe('after render', () => {

      it('should return an empty object, if there are no child types', function() {
        var formType = new FormType();
        formType.render();

        assert(_.isEqual(formType.getData(), {}));
      });

      it('should return a hash of all the child type values, by type name', function() {
        var formType = new FormType({
          children: [
            new TextType({
              name: 'fullName',
              data: 'John Doe'
            }),
            new ChoiceType({
              name: 'country',
              choices: {
                us: 'United State',
                ca: 'Canada'
              },
              data: 'ca'
            })
          ]
        });
        formType.render();

        assert(_.isEqual(formType.getData(), {
          fullName: 'John Doe',
          country: 'ca'
        }));
      });

      it('should reflect changes to child type form elements', function() {
        var $form:JQuery, $input:JQuery, $select:JQuery;
        var formType = new FormType({
          children: [
            new TextType({
              name: 'fullName',
              data: 'John Doe'
            }),
            new ChoiceType({
              name: 'country',
              choices: {
                us: 'United State',
                ca: 'Canada'
              },
              data: 'ca'
            })
          ]
        });
        formType.render();

        $form = $(formType.el);
        $input = $form.find('input');
        $select = $form.find('select');

        $input.val('Bob The Bob');
        $select.val('us');

        assert(_.isEqual(formType.getData(), {
          fullName: 'Bob The Bob',
          country: 'us'
        }));
      });

      it('should get data for nested FormType children', function() {
        var formType = new FormType({
          children: [
            new TextType({
              name: 'fullName',
              data: 'John Doe'
            }),
            new ChoiceType({
              name: 'country',
              choices: {
                us: 'United State',
                ca: 'Canada'
              },
              data: 'ca'
            }),
            new FormType({
              name: 'contactInfo',
              children: [
                new TextType({
                  name: 'phoneNumber',
                  data: '555-1234'
                }),
                new TextType({
                  name: 'email',
                  data: 'joeShmo@example.com'
                })
              ]
            })
          ]
        });
        formType.render();

        assert(_.isEqual(formType.getData(), {
          fullName: 'John Doe',
          country: 'ca',
          contactInfo: {
            phoneNumber: '555-1234',
            email: 'joeShmo@example.com'
          }
        }));
      });

    });

  });

  describe('change event', () => {

    it('should fire when any child type changes', (done) => {
      var onChange = sinon.spy();
      var input:HTMLInputElement;
      var formType = new FormType({
        children: [
          new TextType({
            name: 'fullName'
          })
        ]
      });
      formType.render();

      input = formType.el.getElementsByTagName('input').item(0);

      formType.on('change', () => {
        assert.equal(formType.getData()['fullName'], 'Bob the Bob');
        onChange();
        done();
      });

      DomEvents.dispatchInputEvent(input, 'Bob the Bob');
      assert(onChange.called);
    });

  });

  describe('change:[child] event', () => {

    it('should fire when the child type changes', (done) => {
      var onChange = sinon.spy();
      var input:HTMLInputElement;
      var formType = new FormType({
        children: [
          new TextType({
            name: 'fullName'
          })
        ]
      });
      formType.render();

      input = formType.el.getElementsByTagName('input').item(0);

      formType.on('change:fullName', () => {
        assert.equal(formType.getData()['fullName'], 'Bob the Bob');
        onChange();
        done();
      });

      DomEvents.dispatchInputEvent(input, 'Bob the Bob');
      assert(onChange.called);
    });

  });

  describe('functional tests', () => {

    it('should swap out child types', () => {
      var $form:JQuery, $countrySelect:JQuery;
      var usForm = new FormType({
        name: 'usForm',
        children: [
          new ChoiceType({
            name: 'sodaOrPop',
            choices: {
              'soda': 'It\' called soda',
              'pop': 'No, it\'s caled pop.'
            }
          })
        ]
      });
      var franceForm = new FormType({
        name: 'franceForm',
        children: [
          new ChoiceType({
            name: 'croissantOrBaguette',
            choices: {
              'croissant': 'Croissant',
              'baguette': 'Baguette'
            }
          })
        ]
      });

      var formType = new FormType({
        children: [
          new ChoiceType({
            name: 'country',
            choices: {
              us: 'United State',
              fr: 'France'
            },
            data: 'us'
          }),
          usForm
        ]
      });


      formType.on('change:country', () => {
        var selectedCountry = formType.getData()['country'];
        if (selectedCountry === 'us') {
          formType.removeChild('franceForm');
          formType.addChild(usForm)
        }
        else if (selectedCountry = 'fr') {
          formType.removeChild('usForm');
          formType.addChild(franceForm);
        }
      });

      formType.render();
      $form = $(formType.el);
      $countrySelect = $form.find('[name=country]');

      // Switch to France form
      DomEvents.dispatchChangeEvent($countrySelect[0], 'fr');

      // Check that the US form was replaced with the French form
      assert.equal($form.find('[name=sodaOrPop]').length, 0);
      assert.equal($form.find('[name=croissantOrBaguette]').length, 1);

      // Switch back to US form
      DomEvents.dispatchChangeEvent($countrySelect[0], 'us');

      // Check that the French form was replaced with the US form
      assert.equal($form.find('[name=croissantOrBaguette]').length, 0);
      assert.equal($form.find('[name=sodaOrPop]').length, 1);
    });

  });

});