/**
 * Internet Explorer 11 does not support `once` and also does not support
 * passing `eventOptions`. In some situations it then throws a weird script
 * error, like:
 *
 * ```
 * Could not complete the operation due to error 80020101
 * ```
 *
 * This flag determines, whether `{ once: true }` and thus also event options in
 * general are supported.
 */
export const SUPPORTS_EVENT_OPTIONS = (() => {
  try {
    const div = document.createElement('div');
    let counter = 0;
    div.addEventListener('click', () => counter++);

    let event;
    if (typeof Event === 'function') {
      event = new Event('click');
    } else {
      event = document.createEvent('Event');
      event.initEvent('click', true, true);
    }

    div.dispatchEvent(event);
    div.dispatchEvent(event);

    return counter === 1;
  } catch (err) {
    return false;
  }
})();

/**
 * Safely invokes `addEventListener` for IE11 and also polyfills the
 * `{ once: true }` option. All other options are discarded for IE11.
 *
 * @param {Element} element
 * @param {string} eventName
 * @param {Function} callback
 * @param {object} [eventOptions]
 */
export default function addEventListener(
  element,
  eventName,
  callback,
  eventOptions
) {
  if (SUPPORTS_EVENT_OPTIONS) {
    element.addEventListener(eventName, callback, eventOptions);
  } else if (eventOptions && eventOptions.once) {
    addEventListenerOnce(element, eventName, callback);
  } else {
    element.addEventListener(eventName, callback);
  }
}

/**
 * Registers an event for an `element` that is called exactly once and then
 * unregistered again. This is effectively a polyfill for `{ once: true }`.
 *
 * @param {Element} element
 * @param {string} eventName
 * @param {Function} callback
 */
export function addEventListenerOnce(element, eventName, callback) {
  function listener() {
    element.removeEventListener(eventName, listener);
    callback();
  }
  element.addEventListener(eventName, listener);
}
