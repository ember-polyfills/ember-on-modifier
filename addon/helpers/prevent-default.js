import { deprecate } from '@ember/application/deprecations';
import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

export function preventDefault([handler]) {
  deprecate(
    '`(prevent-default)` has been moved to `ember-event-helpers`.',
    false,
    {
      id: 'ember-on-modifier.prevent-default',
      until: '1.0.0',
      url: 'https://github.com/buschtoens/ember-event-helpers'
    }
  );
  assert(
    `Expected '${handler}' to be a function, if present.`,
    !handler || typeof handler === 'function'
  );

  return function (event) {
    assert(
      `Expected '${event}' to be an Event and have a 'preventDefault' method.`,
      event && typeof event.preventDefault === 'function'
    );

    event.preventDefault();

    if (handler) handler(event);
  };
}

export default helper(preventDefault);
