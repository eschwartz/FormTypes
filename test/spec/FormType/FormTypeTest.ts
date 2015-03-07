///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import assert = require('assert');
import FormType = require('../../../src/FormType/FormType');
import TextType = require('../../../src/FormType/TextType');
import ChoiceType = require('../../../src/FormType/ChoiceType');
import _ = require('underscore');
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

});