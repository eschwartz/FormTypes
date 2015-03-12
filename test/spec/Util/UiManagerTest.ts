///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
///ts:import=UiManager.ts
import UiManager = require('../../../src/Util/UiManager'); ///ts:import:generated
import sinon = require('sinon');
import _ = require('underscore');
import assert = require('assert');
var jsdom:jsdom = require('mocha-jsdom');
var isNodeEnv = typeof window === 'undefined';

describe('UiManager', () => {
  var $:JQueryStatic;

  if (isNodeEnv) {
    jsdom();
  }

  before(() => {
    $ = require('jquery');
  });

  describe('named ui element', () => {

    it('should return references to named UI elements', () => {
      var $scope:JQuery = $('\
<div id="scopeEl">\
  <div class="childA">\
    <div class="nestedChild"></div>\
  </div>\
</div>\
    ');
      var uiManager = new UiManager($scope.get(0), {
        childA: '.childA',
        nestedChild: '.nestedChild'
      });

      assert.equal(uiManager.get('childA'), $scope.children('.childA')[0]);
      assert.equal(uiManager.get('nestedChild'), $scope.find('.nestedChild')[0]);
    });

    it('should lazy evaluate references', () => {
      var $scope:JQuery = $('\
<div id="scopeEl">\
  <div class="childA"></div>\
</div>\
    ');
      var uiManager = new UiManager($scope.get(0), {
        childA: '.childA',
        childB: '.childB'
      });
      var $childB = $('<div class="childB"></div>');
      $scope.append($childB);

      assert.equal(uiManager.get('childB'), $childB[0]);
    });

  });

  // unfortunately, the events test suite
  // does not work very well in a node env.
  if (!isNodeEnv) {
    describe('events', () => {
      var $scope:JQuery;

      beforeEach(() => {
        $scope = $('\
<div>\
  <div class="child-a" style="width:10px; height:10px;"></div>\
  <div class="child-b"></div>\
</div>\
      ');

        // IMPORTANT:
        // $scope must be in the actual dom for events to work properly.
        $('body').append($scope);
      });

      afterEach(() => {
        $scope.remove();
      });

      describe('delegateEvents', () => {

        // This one works in browser tests,
        // but fails in node env
        it('should delegate events to the scope element', () => {
          var onClick = sinon.spy();
          var uiManager = new UiManager($scope[0]);

          uiManager.delegateEvents({
            click: onClick
          });

          $scope.click();
          assert(onClick.called);
        });

        // I can get this to work IRL,
        // but I cannot figure out how to simulate click
        // which propagate to the parent element
        // in test environment
        it('should delegate events to named UI elements', () => {
          var onChildAClick = sinon.spy();
          var onChildBClick = sinon.spy();
          var uiManager = new UiManager($scope[0], {
            childA: '.child-a',
            childB: '.child-b'
          });

          uiManager.delegateEvents({
            'click childA': onChildAClick,
            'click childB': onChildBClick
          });

          $scope.children('.child-a').click();


          assert(onChildAClick.called, 'Expected childA onClick listener to have been called');
          assert(!onChildBClick.called, 'Expected childB onClick listener to not yet have been called');

          $scope.children('.child-b').click();
          assert(onChildBClick.called, 'Expected childB onClick listener to have been called');
          assert.equal(onChildAClick.callCount, 1)
        });
      });

      describe('undelegateEvent', () => {

        it('should undelegate scope events', () => {
          var onClick = sinon.spy();
          var uiManager = new UiManager($scope[0]);

          uiManager.delegateEvents({
            click: onClick
          });
          uiManager.undelegateEvent('click');

          $scope.click();
          assert(!onClick.called);
        });

        it('should undelegate child UI events', () => {
          var onChildAClick = sinon.spy();
          var onChildBClick = sinon.spy();
          var uiManager = new UiManager($scope[0], {
            childA: '.child-a',
            childB: '.child-b'
          });

          uiManager.delegateEvents({
            'click childA': onChildAClick,
            'click childB': onChildBClick
          });

          uiManager.undelegateEvent('click childA');

          $scope.find('.child-a').click();
          assert(!onChildAClick.called);

          $scope.find('.child-b').click();
          assert(onChildBClick.called, "childB listener should still exist");
        });

      });

      describe('undelegateAllEvents', () => {

        it('should undelegate all events', () => {
          var onChildAClick = sinon.spy();
          var onChildBClick = sinon.spy();
          var uiManager = new UiManager($scope[0], {
            childA: '.child-a',
            childB: '.child-b'
          });

          uiManager.delegateEvents({
            'click childA': onChildAClick,
            'click childB': onChildBClick
          });

          uiManager.undelegateAllEvents();

          $scope.find('.child-a').click();
          assert(!onChildAClick.called);

          $scope.find('.child-b').click();
          assert(!onChildBClick.called);
        });

      });

    });
  }

});
