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
import GroupType = require('../../../src/FormType/GroupType');
import TextType = require('../../../src/FormType/TextType');
import ChoiceType = require('../../../src/FormType/ChoiceType');
import _ = require('underscore');
import DomEvents = require('../../Util/DomEvents');
import sinon = require('sinon');
var jsdom:jsdom = require('mocha-jsdom');

describe('GroupType', () => {
  var $:JQueryStatic;

  if (typeof window === 'undefined') {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('render', () => {

    it('should render an empty HTML div element', () => {
      var groupType = new GroupType();
      var $group:JQuery;

      groupType.render();
      $group = $(groupType.el);

      assert.equal($group.prop('tagName').toLowerCase(), 'div', 'Expected div element to exist');
      assert.equal($group.children().length, 0, 'Expected group to have no children');
    });

    it('should render child form types', () => {
      var $group:JQuery, $inputs:JQuery;
      var groupType = new GroupType({
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

      $group = $(groupType.render().el);
      $inputs = $group.find('input');

      assert.equal($inputs.length, 2,
        'Expected 2 child inputs to be rendered');

      assert.equal($inputs.eq(0).attr('name'), 'fooInput');
      assert.equal($inputs.eq(1).attr('name'), 'barInput');

      assert.equal($inputs.eq(0).val(), 'foo');
      assert.equal($inputs.eq(1).val(), 'bar');
    });

  });

  describe('setErrors', function() {

    it('should render form errors (called before render)', function() {
      var $errors:JQuery;
      var groupType = new GroupType();
      
      groupType.setErrors({
        form: ['form error A', 'form error B']
      });
      
      groupType.render();

      $errors = $(groupType.el).find('.error');
      assert.equal($errors.length, 2, 'Should render 2 errors');
      assert.equal($errors.eq(0).text(), 'form error A', 'Should render the error text (1)');
      assert.equal($errors.eq(1).text(), 'form error B', 'Should render the error text (2)');
    });

    it('should render form errors (called after render)', function() {
      var $errors:JQuery;
      var groupType = new GroupType();

      groupType.render();

      groupType.setErrors({
        form: ['form error A', 'form error B']
      });

      $errors = $(groupType.el).find('.error');
      assert.equal($errors.length, 2, 'Should render 2 errors');
      assert.equal($errors.eq(0).text(), 'form error A', 'Should render the error text (1)');
      assert.equal($errors.eq(1).text(), 'form error B', 'Should render the error text (2)');
    });

    it('should render field errors', function() {
      var $fields:JQuery;
      var groupType = new GroupType({
        children: [
          new TextType({
            name: 'fooInput'
          }),
          new TextType({
            name: 'barInput'
          })
        ]
      });
      groupType.render();

      groupType.setErrors({
        fields: {
          fooInput: {
            form: ['foo is no good']
          },
          barInput: {
            form: ['bar is not great either']
          }
        }
      });

      $fields = $(groupType.el).children();
      assert.equal($fields.eq(0).find('.error').text(), 'foo is no good');
      assert.equal($fields.eq(1).find('.error').text(), 'bar is not great either');
    });

    it('should render nested errors', function() {
      var $nestedGroup:JQuery, $nestedField:JQuery;
      var groupType = new GroupType({
        children: [
          new GroupType({
            name: 'nestedGroup',
            children: [
              new TextType({
                name: 'nestedField'
              })
            ]
          })
        ]
      });
      groupType.render();

      groupType.setErrors({
        nestedGroup: {
          form: ['error for nestedGroup'],
          fields: {
            nestedField: {
              form: ['error for nestedField']
            }
          }
        }
      });

      $nestedGroup = $(groupType.el).children();
      $nestedField = $nestedGroup.children();

      assert.equal($nestedGroup.children('.error').text(), 'error for nestedGroup');
      assert.equal($nestedField.children('.error').text(), 'error for nestedField');
    });

    it('should override existing field errors', function() {
      var $fields:JQuery;
      var groupType = new GroupType({
        children: [
          new TextType({
            name: 'fooInput'
          }),
          new TextType({
            name: 'barInput'
          })
        ]
      });
      groupType.render();

      groupType.setErrors({
        form: ['form error A', 'form error B'],
        fields: {
          fooInput: {
            form: ['fooInput error']
          },
          barInput: {
            form: ['barInput error']
          }
        }
      });

      groupType.setErrors({
        form: ['changed form error'],
        fields: {
          fooInput: {
            form: ['changed fooInput error']
          }
        }
      });

      $fields = $(groupType.el).children();

      assert.equal($(groupType.el).children('.error').text(), 'changed form error', 'Should update the form error');
      assert.equal($fields.find('.error').length, 1, 'Should remove old errors');
      assert.equal($fields.find('.error').text(), 'changed fooInput error');
    });

  });

  describe('clearErrors', function() {

    it('should remove all form errors', function() {
      console.warn('Spec not yet defined');
    });

    it('should remove all field errors', function() {
      console.warn('Spec not yet defined');
    });

  });

  describe('removeChild', () => {

    it('should remove a child element from the dom', () => {
      var child:TextType;
      var groupType = new GroupType({
        children: [
          child = new TextType({
            name: 'fooInput',
            data: 'foo'
          })
        ]
      });

      groupType.render();

      assert.equal($(groupType.el).find(child.el).length, 1, 'Child should have a parent element (baseline)');

      groupType.removeChild(child);

      assert.equal($(groupType.el).find(child.el).length, 0, 'Child should not have a parent element');
    });

    it('should not complain if the GroupType is not rendered', () => {
      var child:TextType;
      var groupType = new GroupType({
        children: [
          child = new TextType({
            name: 'fooInput',
            data: 'foo'
          })
        ]
      });

      groupType.removeChild(child);
    });

    it('should not complain if the child element was closed independently', () => {
      var child:TextType;
      var groupType = new GroupType({
        children: [
          child = new TextType({
            name: 'fooInput',
            data: 'foo'
          })
        ]
      });

      groupType.render();

      child.close();

      groupType.removeChild(child);
    });

  });

  describe('getData', () => {

    describe('before render', () => {

      it('should return bootstrapped data', () => {
        var groupType = new GroupType({
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

        assert(_.isEqual(groupType.getData(), {
          fullName: 'John Doe',
          country: 'ca'
        }));
      });

    });

    describe('after render', () => {

      it('should return an empty object, if there are no child types', function() {
        var groupType = new GroupType();
        groupType.render();

        assert(_.isEqual(groupType.getData(), {}));
      });

      it('should return a hash of all the child type values, by type name', function() {
        var groupType = new GroupType({
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
        groupType.render();

        assert(_.isEqual(groupType.getData(), {
          fullName: 'John Doe',
          country: 'ca'
        }));
      });

      it('should reflect changes to child type form elements', function() {
        var $group:JQuery, $input:JQuery, $select:JQuery;
        var groupType = new GroupType({
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

        $group = $(groupType.el);
        $input = $group.find('input');
        $select = $group.find('select');

        $input.val('Bob The Bob').trigger('input');
        $select.val('us').trigger('change');

        assert(_.isEqual(groupType.getData(), {
          fullName: 'Bob The Bob',
          country: 'us'
        }));
      });

      it('should get data for nested GroupType children', function() {
        var groupType = new GroupType({
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
            new GroupType({
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
        groupType.render();

        assert(_.isEqual(groupType.getData(), {
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

  describe('setData', () => {

    it('should set data for all child elements', () => {
      var $group:JQuery;
      var groupType = new GroupType({
        children: [
          new TextType({
            name: 'firstName'
          }),
          new TextType({
            name: 'lastName'
          }),
          new GroupType({
            name: 'contactInfo',
            children: [
              new TextType({
                name: 'phoneNumber'
              }),
              new TextType({
                name: 'email'
              })
            ]
          })
        ]
      });
      groupType.render();

      groupType.setData({
        firstName: 'John',
        lastName: 'Doe',
        contactInfo: {
          phoneNumber: '555-1212',
          email: 'john_doe@example.com'
        }
      });

      $group = $(groupType.el);

      assert.equal($group.find('[name=firstName]').val(), 'John');
      assert.equal($group.find('[name=lastName]').val(), 'Doe');
      assert.equal($group.find('[name=phoneNumber]').val(), '555-1212');
      assert.equal($group.find('[name=email]').val(), 'john_doe@example.com');

      assert(_.isEqual(groupType.getData(), {
        firstName: 'John',
        lastName: 'Doe',
        contactInfo: {
          phoneNumber: '555-1212',
          email: 'john_doe@example.com'
        }
      }));
    });

  });

  describe('change event', () => {

    it('should fire when any child type changes', (done) => {
      var onChange = sinon.spy();
      var input:HTMLInputElement;
      var groupType = new GroupType({
        children: [
          new TextType({
            name: 'fullName'
          })
        ]
      });
      groupType.render();

      input = groupType.el.getElementsByTagName('input').item(0);

      groupType.on('change', () => {
        assert.equal(groupType.getData()['fullName'], 'Bob the Bob');
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
      var groupType = new GroupType({
        children: [
          new TextType({
            name: 'fullName'
          })
        ]
      });
      groupType.render();

      input = groupType.el.getElementsByTagName('input').item(0);

      groupType.on('change:fullName', () => {
        assert.equal(groupType.getData()['fullName'], 'Bob the Bob');
        onChange();
        done();
      });

      DomEvents.dispatchInputEvent(input, 'Bob the Bob');
      assert(onChange.called);
    });

  });
  
});