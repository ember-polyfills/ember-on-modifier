import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

export function preventDefault([handler]) {
  assert(
    `Expected '${handler}' to be a function, if present.`,
    !handler || typeof handler === 'function'
  );

  return function(event) {
    assert(
      `Expected '${event}' to be an Event and have a 'preventDefault' method.`,
      event && typeof event.preventDefault === 'function'
    );

    event.preventDefault();

    if (handler) handler(event);
  };
}

export default helper(preventDefault);
