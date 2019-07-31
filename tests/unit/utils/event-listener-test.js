import { module, test } from 'qunit';

import { SUPPORTS_EVENT_OPTIONS } from 'ember-on-modifier/utils/event-listener';

module('Unit | Utility | event-listener', function() {
  test('SUPPORTS_EVENT_OPTIONS has the right value', function(assert) {
    const { userAgent } = navigator;
    if (userAgent.includes('Chrome/')) {
      assert.ok(
        SUPPORTS_EVENT_OPTIONS,
        'Google Chrome has support for event options'
      );
    } else if (userAgent.includes('Firefox/')) {
      assert.ok(
        SUPPORTS_EVENT_OPTIONS,
        'Firefox has support for event options'
      );
    } else if (userAgent.includes('Trident/')) {
      assert.notOk(
        SUPPORTS_EVENT_OPTIONS,
        'Internet Explorer 11 has no support for event options'
      );
    } else {
      throw new Error(`Could not detect browser from: ${userAgent}`);
    }
  });
});
