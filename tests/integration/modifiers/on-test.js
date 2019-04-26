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
    assert.expect(6);

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

    assert.counts({ adds: 1, removes: 0 });

    await click('button');

    assert.counts({ adds: 1, removes: 0 });
  });

  test('it can accept the `once` option', async function(assert) {
    assert.expect(3);

    let n = 0;
    this.someMethod = () => n++;

    await render(
      hbs`<button {{on "click" this.someMethod once=true}}></button>`
    );

    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    await click('button');

    assert.counts({ adds: 1, removes: 0 });

    assert.strictEqual(n, 1, 'callback has only been called once');
  });

  test('unrelated property changes do not break the `once` option', async function(assert) {
    assert.expect(5);

    let n = 0;
    this.someMethod = () => n++;
    this.someProp = 0;

    await render(
      hbs`<button {{on "click" this.someMethod once=true}}>{{this.someProp}}</button>`
    );

    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    await click('button');

    assert.counts({ adds: 1, removes: 0 });

    assert.strictEqual(n, 1, 'callback has only been called once');

    set(this, 'someProp', 1);
    await settled();
    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    assert.strictEqual(n, 1, 'callback has only been called once');
  });

  test('unrelated property changes do not cause the listener to re-register', async function(assert) {
    assert.expect(2);

    this.someMethod = () => {};
    this.someProp = 0;

    await render(
      hbs`<button {{on "click" this.someMethod}}>{{this.someProp}}</button>`
    );
    assert.counts({ adds: 1, removes: 0 });

    set(this, 'someProp', 1);
    await settled();
    assert.counts({ adds: 1, removes: 0 });
  });

  test('it can accept the `capture` option', async function(assert) {
    assert.expect(5);

    this.outerListener = () => assert.step('outer');
    this.innerListener = () => assert.step('inner');

    await render(hbs`
      <div {{on "click" this.outerListener capture=true}}>
        <button {{on "click" this.innerListener}}>inner</button>
      </div>
    `);

    assert.counts({ adds: 2, removes: 0 });

    await click('button');

    assert.counts({ adds: 2, removes: 0 });

    assert.verifySteps(
      ['outer', 'inner'],
      'outer capture listener was called first'
    );
  });

  test('it can accept the `once` & `capture` option combined', async function(assert) {
    assert.expect(6);

    this.outerListener = () => assert.step('outer');
    this.innerListener = () => assert.step('inner');

    await render(hbs`
      <div {{on "click" this.outerListener once=true capture=true}}>
        <button {{on "click" this.innerListener}}>inner</button>
      </div>
    `);

    assert.counts({ adds: 2, removes: 0 });

    await click('button');
    await click('button');

    assert.counts({ adds: 2, removes: 0 });

    assert.verifySteps(
      ['outer', 'inner', 'inner'],
      'outer capture listener was called first and was then unregistered'
    );
  });

  test('it raises an assertion when calling `event.preventDefault()` on a `passive` event', async function(assert) {
    assert.expect(3);

    this.handler = event => {
      assert.expectAssertion(
        () => event.preventDefault(),
        `ember-on-modifier: You marked this listener as 'passive', meaning that you must not call 'event.preventDefault()'.`
      );
    };

    await render(
      hbs`<button {{on "click" this.handler passive=true}}></button>`
    );

    assert.counts({ adds: 1, removes: 0 });

    await click('button');

    assert.counts({ adds: 1, removes: 0 });
  });

  (gte('3.0.0') // I have no clue how to catch the error in Ember 2.13
    ? test
    : skip)('it raises an assertion if an invalid event option is passed in', async function(assert) {
    assert.expect(2);

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

    assert.counts({ adds: 0, removes: 0 });
  });

  (gte('3.0.0') // I have no clue how to catch the error in Ember 2.13
    ? test
    : skip)('it raises an assertion if an invalid event name or callback is passed in', async function(assert) {
    setupOnerror(error => assert.step(error.message));

    await render(hbs`<button {{on "click" 10}}></button>`);
    await render(hbs`<button {{on "click"}}></button>`);
    await render(hbs`<button {{on "" undefined}}></button>`);
    await render(hbs`<button {{on 10 undefined}}></button>`);
    await render(hbs`<button {{on}}></button>`);

    assert.counts({ adds: 0, removes: 0 });

    assert.verifySteps([
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
    assert.expect(9);

    const errors = [];
    setupOnerror(error => errors.push(error));

    let n = 0;
    this.someMethod = () => n++;

    await render(
      hbs`<button data-foo="some-thing" {{on "click" this.someMethod}}></button>`
    );
    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    assert.strictEqual(n, 1);
    assert.counts({ adds: 1, removes: 0 });

    run(() => set(this, 'someMethod', undefined));
    await settled();
    assert.counts({ adds: 1, removes: 1 });

    await click('button');
    assert.strictEqual(n, 1);
    assert.counts({ adds: 1, removes: 1 });

    run(() => set(this, 'someMethod', () => n++));
    await settled();
    assert.counts({ adds: 2, removes: 2 });

    await click('button');
    assert.strictEqual(n, 2);
    assert.counts({ adds: 2, removes: 2 });
  });

  test('it passes additional parameters through to the listener', async function(assert) {
    assert.expect(11);

    this.a = 1;
    this.b = 3;
    this.c = 5;
    this.someMethod = (a, b, c, event) => {
      assert.step([a, b, c].join('-'));
      assert.ok(event instanceof MouseEvent, 'last parameter is an event');
    };

    await render(
      hbs`<button {{on "click" this.someMethod this.a this.b this.c}}>{{this.c}}</button>`
    );
    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    await click('button');
    assert.counts({ adds: 1, removes: 0 });

    run(() => set(this, 'c', 7));
    await settled();
    assert.counts({ adds: 2, removes: 1 });

    await click('button');
    assert.counts({ adds: 2, removes: 1 });

    assert.verifySteps(
      [[1, 3, 5], [1, 3, 5], [1, 3, 7]].map(s => s.join('-')),
      'parameters were passed through and updated on change'
    );
  });

  test('it is re-registered, when the callback changes', async function(assert) {
    assert.expect(6);

    let a = 0;
    this.someMethod = () => a++;

    await render(hbs`<button {{on "click" this.someMethod}}></button>`);
    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    assert.counts({ adds: 1, removes: 0 });

    let b = 0;
    run(() => set(this, 'someMethod', () => b++));
    await settled();
    assert.counts({ adds: 2, removes: 1 });

    await click('button');
    assert.counts({ adds: 2, removes: 1 });

    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
  });

  test('it is re-registered, when the callback changes and `capture` is used', async function(assert) {
    assert.expect(9);

    let a = 0;
    this.someMethod = () => a++;
    this.capture = true;

    await render(
      hbs`<button {{on "click" this.someMethod capture=this.capture}}></button>`
    );
    assert.counts({ adds: 1, removes: 0 });

    await click('button');
    assert.counts({ adds: 1, removes: 0 });

    let b = 0;
    run(() => set(this, 'someMethod', () => b++));
    await settled();
    assert.counts({ adds: 2, removes: 1 });

    await click('button');
    assert.counts({ adds: 2, removes: 1 });

    let c = 0;
    run(() => {
      set(this, 'someMethod', () => c++);
      set(this, 'capture', false);
    });
    await settled();
    assert.counts({ adds: 3, removes: 2 });

    await click('button');
    assert.counts({ adds: 3, removes: 2 });

    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
    assert.strictEqual(c, 1);
  });
});
