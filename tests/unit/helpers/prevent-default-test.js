import { module } from 'qunit';

import require from 'require';

import { skipIfEventHelpersInstalled } from '../../helpers/ember-event-helpers';

module('Unit | Helper | prevent-default', function (hooks) {
  hooks.before(function () {
    this.preventDefault = require('ember-on-modifier/helpers/prevent-default').preventDefault;
  });

  skipIfEventHelpersInstalled(
    'it throws an assertion, when used incorrectly',
    function (assert) {
      assert.expectAssertion(() => {
        this.preventDefault(['not a function']);
      }, `Expected 'not a function' to be a function, if present.`);

      assert.expectAssertion(() => {
        this.preventDefault([])('not an event');
      }, `Expected 'not an event' to be an Event and have a 'preventDefault' method.`);

      assert.expectAssertion(() => {
        this.preventDefault([])({ preventDefault: 'not a method' });
      }, `Expected '[object Object]' to be an Event and have a 'preventDefault' method.`);
    }
  );

  skipIfEventHelpersInstalled('it works without a handler', function (assert) {
    assert.expect(1);
    this.preventDefault([])({
      preventDefault: () => assert.ok(true, `it has called 'preventDefault'`)
    });
  });

  skipIfEventHelpersInstalled('it works with a handler', function (assert) {
    assert.expect(2);
    this.preventDefault([() => assert.ok(true, 'it has called the handler')])({
      preventDefault: () => assert.ok(true, `it has called 'preventDefault'`)
    });
  });

  skipIfEventHelpersInstalled(
    `it calls 'preventDefault', even if the handler throws`,
    function (assert) {
      assert.expect(2);
      assert.throws(
        () =>
          this.preventDefault([
            () => {
              throw new Error('foobar');
            }
          ])({
            preventDefault: () =>
              assert.ok(true, `it has called 'preventDefault'`)
          }),
        /foobar/,
        'The error has bubbled up'
      );
    }
  );
});
