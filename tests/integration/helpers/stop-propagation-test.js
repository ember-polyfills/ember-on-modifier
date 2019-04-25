import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | stop-propagation', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.onAncestorClick = () => {
      throw new Error(`Uncaught 'click' event.`);
    };
  });

  // The rest of this test suite relies on this.
  test('a click event propagates up the DOM by default', async function(assert) {
    assert.expect(1);

    this.onAncestorClick = () => {
      assert.ok(true);
    };

    await render(hbs`
      <div {{on "click" this.onAncestorClick}}>
        <button>Click me</button>
      </div>
    `);

    await click('button');
  });

  test('{{on "click" (stop-propagation)}}', async function(assert) {
    assert.expect(0);

    await render(hbs`
      <div {{on "click" this.onAncestorClick}}>
        <button {{on "click" (stop-propagation)}}>Click me</button>
      </div>
    `);

    await click('button');
  });

  test('{{on "click" this.onClick}} {{on "click" (stop-propagation)}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <div {{on "click" this.onAncestorClick}}>
        <button
          {{on "click" this.onClick}}
          {{on "click" (stop-propagation)}}
        >
          Click me
        </button>
      </div>
    `);

    await click('button');
  });

  test('{{on "click" (stop-propagation)}} {{on "click" this.onClick}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <div {{on "click" this.onAncestorClick}}>
        <button
          {{on "click" (stop-propagation)}}
          {{on "click" this.onClick}}
        >
          Click me
        </button>
      </div>
    `);

    await click('button');
  });

  test('{{on "click" (stop-propagation this.onClick)}}', async function(assert) {
    assert.expect(1);

    this.onClick = event => assert.ok(event instanceof Event);

    await render(hbs`
      <div {{on "click" this.onAncestorClick}}>
        <button {{on "click" (stop-propagation this.onClick)}}>
          Click me
        </button>
      </div>
    `);

    await click('button');
  });
});
