import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { run } from '@ember/runloop';

module('Integration | Modifier | on', function(hooks) {
  setupRenderingTest(hooks);

  test('it basically works', async function(assert) {
    assert.expect(3);

    this.someMethod = event => {
      assert.ok(
        event instanceof MouseEvent,
        'first argument is a `ClickEvent`'
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
