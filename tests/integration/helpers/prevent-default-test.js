import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | prevent-default', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.onSubmit = event => {
      // In case the submit event is not prevented, we still want to prevent the
      // actual form submission. Otherwise we accidentally abort all tests by
      // reloading the page.
      event.preventDefault();
      throw new Error(`Uncaught 'submit' event.`);
    };
  });

  // The rest of this test suite relies on this.
  test('a submit button works in tests and submits the form', async function(assert) {
    assert.expect(1);

    this.onSubmit = event => {
      event.preventDefault();
      assert.ok(true);
    };

    await render(hbs`
      <form {{on "submit" this.onSubmit}}>
        <button type="submit">Click me</button>
      </form>
    `);

    await click('button');
  });

  test('{{on "click" (prevent-default)}}', async function(assert) {
    assert.expect(0);

    await render(hbs`
      <form {{on "submit" this.onSubmit}}>
        <button type="submit" {{on "click" (prevent-default)}}>Click me</button>
      </form>
    `);

    await click('button');
  });

  test('{{on "click" this.onClick}} {{on "click" (prevent-default)}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <form {{on "submit" this.onSubmit}}>
        <button
          type="submit"
          {{on "click" this.onClick}}
          {{on "click" (prevent-default)}}
        >
          Click me
        </button>
      </form>
    `);

    await click('button');
  });

  test('{{on "click" (prevent-default)}} {{on "click" this.onClick}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <form {{on "submit" this.onSubmit}}>
        <button
          type="submit"
          {{on "click" (prevent-default)}}
          {{on "click" this.onClick}}
        >
          Click me
        </button>
      </form>
    `);

    await click('button');
  });

  test('{{on "click" (prevent-default this.onClick)}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <form {{on "submit" this.onSubmit}}>
        <button
          type="submit"
          {{on "click" (prevent-default this.onClick)}}
        >
          Click me
        </button>
      </form>
    `);

    await click('button');
  });
});
