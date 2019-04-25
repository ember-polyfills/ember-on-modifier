import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

export function stopPropagation([handler]) {
  assert(
    `Expected '${handler}' to be a function, if present.`,
    !handler || typeof handler === 'function'
  );

  return function(event) {
    assert(
      `Expected '${event}' to be an Event and have a 'stopPropagation' method.`,
      event && typeof event.stopPropagation === 'function'
    );

    event.stopPropagation();

    if (handler) handler(event);
  };
}

export default helper(stopPropagation);
