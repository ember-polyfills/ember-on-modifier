import { preventDefault } from 'ember-on-modifier/helpers/prevent-default';
import { module, test } from 'qunit';

module('Unit | Helper | prevent-default', function() {
  test('it throws an assertion, when used incorrectly', function(assert) {
    assert.expectAssertion(() => {
      preventDefault(['not a function']);
    }, `Expected 'not a function' to be a function, if present.`);

    assert.expectAssertion(() => {
      preventDefault([])('not an event');
    }, `Expected 'not an event' to be an Event and have a 'preventDefault' method.`);

    assert.expectAssertion(() => {
      preventDefault([])({ preventDefault: 'not a method' });
    }, `Expected '[object Object]' to be an Event and have a 'preventDefault' method.`);
  });

  test('it works without a handler', function(assert) {
    assert.expect(1);
    preventDefault([])({
      preventDefault: () => assert.ok(true, `it has called 'preventDefault'`)
    });
  });

  test('it works with a handler', function(assert) {
    assert.expect(2);
    preventDefault([() => assert.ok(true, 'it has called the handler')])({
      preventDefault: () => assert.ok(true, `it has called 'preventDefault'`)
    });
  });

  test(`it calls 'preventDefault', even if the handler throws`, function(assert) {
    assert.expect(2);
    assert.throws(
      () =>
        preventDefault([
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
  });
});
