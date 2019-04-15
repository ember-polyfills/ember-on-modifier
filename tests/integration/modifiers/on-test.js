import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  settled,
  setupOnerror,
  resetOnerror
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { gte } from 'ember-compatibility-helpers';

module('Integration | Modifier | on', function(hooks) {
  setupRenderingTest(hooks);
  hooks.afterEach(() => resetOnerror());

  test('it basically works', async function(assert) {
    assert.expect(4);

    this.someMethod = function(event) {
      assert.ok(
        this instanceof HTMLButtonElement && this.dataset.foo === 'some-thing',
        'this context is the element'
      );
      assert.ok(
        event instanceof MouseEvent,
        'first argument is a `MouseEvent`'
      );
      assert.strictEqual(
        event.target.tagName,
        'BUTTON',
        'correct element tagName'
      );
      assert.dom(event.target).hasAttribute('data-foo', 'some-thing');
    };

    await render(
      hbs`<button data-foo="some-thing" {{on "click" this.someMethod}}></button>`
    );

    await click('button');
  });

  test('it can accept the `once` option', async function(assert) {
    assert.expect(1);

    let n = 0;
    this.someMethod = () => n++;

    await render(
      hbs`<button {{on "click" this.someMethod once=true}}></button>`
    );

    await click('button');
    await click('button');

    assert.strictEqual(n, 1, 'callback has only been called once');
  });

  test('it can accept the `capture` option', async function(assert) {
    assert.expect(1);

    const calls = [];
    this.outerListener = () => calls.push('outer');
    this.innerListener = () => calls.push('inner');

    await render(hbs`
      <div {{on "click" this.outerListener capture=true}}>
        <button {{on "click" this.innerListener}}>inner</button>
      </div>
    `);

    await click('button');

    assert.deepEqual(
      calls,
      ['outer', 'inner'],
      'outer capture listener was called first'
    );
  });

  test('it can accept the `once` & `capture` option combined', async function(assert) {
    assert.expect(1);

    const calls = [];
    this.outerListener = () => calls.push('outer');
    this.innerListener = () => calls.push('inner');

    await render(hbs`
      <div {{on "click" this.outerListener once=true capture=true}}>
        <button {{on "click" this.innerListener}}>inner</button>
      </div>
    `);

    await click('button');
    await click('button');

    assert.deepEqual(
      calls,
      ['outer', 'inner', 'inner'],
      'outer capture listener was called first and was then unregistered'
    );
  });

  (gte('3.0.0') // I have no clue how to catch the error in Ember 2.13
    ? test
    : skip)('it raises an assertion if an invalid event option is passed in', async function(assert) {
    assert.expect(1);

    setupOnerror(function(error) {
      assert.strictEqual(
        error.message,
        "Assertion Failed: ember-on-modifier: Provided invalid event options ('nope', 'foo') to 'click' event listener. Only these options are valid: 'capture', 'once', 'passive'",
        'error is thrown'
      );
    });

    await render(
      hbs`<button {{on "click" this.someMethod nope=true foo=false}}></button>`
    );
  });

  (gte('3.0.0') // I have no clue how to catch the error in Ember 2.13
    ? test
    : skip)('it raises an assertion if an invalid event name or callback is passed in', async function(assert) {
    const errors = [];
    setupOnerror(error => errors.push(error));

    await render(hbs`<button {{on "click" 10}}></button>`);
    await render(hbs`<button {{on "click"}}></button>`);
    await render(hbs`<button {{on "" undefined}}></button>`);
    await render(hbs`<button {{on 10 undefined}}></button>`);
    await render(hbs`<button {{on}}></button>`);

    assert.deepEqual(errors.map(e => e.message), [
      "Assertion Failed: ember-on-modifier: '10' is not a valid callback. Provide a function.",
      "Assertion Failed: ember-on-modifier: 'undefined' is not a valid callback. Provide a function.",
      "Assertion Failed: ember-on-modifier: '' is not a valid event name. It has to be a string with a minimum length of 1 character.",
      "Assertion Failed: ember-on-modifier: '10' is not a valid event name. It has to be a string with a minimum length of 1 character.",
      "Assertion Failed: ember-on-modifier: 'undefined' is not a valid event name. It has to be a string with a minimum length of 1 character."
    ]);
  });

  (gte('3.0.0') // I have no clue how to catch the error in Ember 2.13
    ? test
    : skip)('it recovers after updating to incorrect parameters', async function(assert) {
    assert.expect(3);

    const errors = [];
    setupOnerror(error => errors.push(error));

    let n = 0;
    this.someMethod = () => n++;

    await render(
      hbs`<button data-foo="some-thing" {{on "click" this.someMethod}}></button>`
    );

    await click('button');
    assert.strictEqual(n, 1);

    run(() => set(this, 'someMethod', undefined));
    await settled();

    await click('button');
    assert.strictEqual(n, 1);

    run(() => set(this, 'someMethod', () => n++));
    await settled();

    await click('button');
    assert.strictEqual(n, 2);
  });

  test('it passes additional parameters though to the listener', async function(assert) {
    assert.expect(4);

    const calls = [];

    this.a = 1;
    this.b = 3;
    this.c = 5;
    this.someMethod = (a, b, c, event) => {
      calls.push([a, b, c]);
      assert.ok(event instanceof MouseEvent, 'last parameter is an event');
    };

    await render(
      hbs`<button {{on "click" this.someMethod this.a this.b this.c}}>{{this.c}}</button>`
    );

    await click('button');
    await click('button');

    run(() => set(this, 'c', 7));
    await settled();

    await click('button');

    assert.deepEqual(
      calls,
      [[1, 3, 5], [1, 3, 5], [1, 3, 7]],
      'parameters were passed through and updated on change'
    );
  });

  test('it is re-registered, when the callback changes', async function(assert) {
    assert.expect(2);

    let a = 0;
    this.someMethod = () => a++;

    await render(hbs`<button {{on "click" this.someMethod}}></button>`);

    await click('button');

    let b = 0;
    run(() => set(this, 'someMethod', () => b++));
    await settled();

    await click('button');

    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
  });

  test('it is re-registered, when the callback changes and `capture` is used', async function(assert) {
    assert.expect(3);

    let a = 0;
    this.someMethod = () => a++;
    this.capture = true;

    await render(
      hbs`<button {{on "click" this.someMethod capture=this.capture}}></button>`
    );

    await click('button');

    let b = 0;
    run(() => set(this, 'someMethod', () => b++));
    await settled();

    await click('button');

    let c = 0;
    run(() => {
      set(this, 'someMethod', () => c++);
      set(this, 'capture', false);
    });
    await settled();

    await click('button');

    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
    assert.strictEqual(c, 1);
  });
});
