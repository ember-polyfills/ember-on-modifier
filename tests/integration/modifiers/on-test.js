import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled, setupOnerror } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { run } from '@ember/runloop';

module('Integration | Modifier | on', function(hooks) {
  setupRenderingTest(hooks);

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

  test('it can accept event options', async function(assert) {
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

  test('it raises an assertion if an invalid event option is passed in', async function(assert) {
    assert.expect(1);
    setupOnerror(function(error) {
      assert.strictEqual(
        error.message,
        "Assertion Failed: ember-on-modifier: Provided invalid event options ('nope', 'foo') to 'click' event listener. Only these options are valid: 'captured', 'once', 'passive'",
        'error is thrown'
      );
    });

    await render(
      hbs`<button {{on "click" this.someMethod nope=true foo=false}}></button>`
    );
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

  test('it does nothing if the callback or event name is `null` or `undefined`', async function(assert) {
    assert.expect(0);

    this.someMethod = () => {};

    await render(hbs`
      <button data-foo="some-thing" {{on "click" null}}></button>
      <button data-foo="some-thing" {{on "click" undefined}}></button>
      <button data-foo="some-thing" {{on null this.someMethod}}></button>
      <button data-foo="some-thing" {{on undefined this.someMethod}}></button>
    `);
  });

  test('it does not crash when updating to or from `null` / `undefined`', async function(assert) {
    assert.expect(3);

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
});
