/* eslint no-param-reassign: "off" */

import { setModifierManager } from '@ember/modifier';
import { addEventListener, removeEventListener } from '../utils/event-listener';
import { assert } from '@ember/debug';
import { deprecate } from '@ember/application/deprecations';
import { DEBUG } from '@glimmer/env';

const assertValidEventOptions =
  DEBUG &&
  (() => {
    const ALLOWED_EVENT_OPTIONS = ['capture', 'once', 'passive'];
    const joinOptions = opts => opts.map(o => `'${o}'`).join(', ');

    return function(eventOptions, eventName) {
      const invalidOptions = Object.keys(eventOptions).filter(
        o => !ALLOWED_EVENT_OPTIONS.includes(o)
      );

      assert(
        `ember-on-modifier: Provided invalid event options (${joinOptions(
          invalidOptions
        )}) to '${eventName}' event listener. Only these options are valid: ${joinOptions(
          ALLOWED_EVENT_OPTIONS
        )}`,
        invalidOptions.length === 0
      );
    };
  })();

function setupListener(element, eventName, callback, eventOptions, params) {
  if (DEBUG) assertValidEventOptions(eventOptions, eventName);
  assert(
    `ember-on-modifier: '${eventName}' is not a valid event name. It has to be a string with a minimum length of 1 character.`,
    typeof eventName === 'string' && eventName.length > 1
  );
  assert(
    `ember-on-modifier: '${callback}' is not a valid callback. Provide a function.`,
    typeof callback === 'function'
  );
  deprecate(
    `ember-on-modifier: Passing additional arguments to be partially applied to the event listener is deprecated in order to comply with the RFC. Use the '{{fn}}' helper instead: https://www.npmjs.com/package/ember-fn-helper`,
    !Array.isArray(params) || params.length === 0,
    {
      id: 'ember-on-modifier.partial-application',
      until: '1.0.0',
      url:
        'https://github.com/emberjs/rfcs/blob/master/text/0471-on-modifier.md'
    }
  );

  if (Array.isArray(params) && params.length > 0) {
    const _callback = callback;
    callback = function(...args) {
      return _callback.call(this, ...params, ...args);
    };
  }

  addEventListener(element, eventName, callback, eventOptions);

  return callback;
}

function destroyListener(element, eventName, callback, eventOptions) {
  if (element && eventName && callback)
    removeEventListener(element, eventName, callback, eventOptions);
}

export default setModifierManager(
  () => ({
    createModifier() {
      return {
        element: null,
        eventName: undefined,
        callback: undefined,
        eventOptions: undefined
      };
    },

    installModifier(
      state,
      element,
      {
        positional: [eventName, callback, ...params],
        named: eventOptions
      }
    ) {
      state.callback = setupListener(
        element,
        eventName,
        callback,
        eventOptions,
        params
      );

      state.element = element;
      state.eventName = eventName;
      state.params = params;
      state.eventOptions = eventOptions;
    },

    updateModifier(
      state,
      {
        positional: [eventName, callback, ...params],
        named: eventOptions
      }
    ) {
      destroyListener(
        state.element,
        state.eventName,
        state.callback,
        state.eventOptions
      );
      state.callback = setupListener(
        state.element,
        eventName,
        callback,
        eventOptions,
        params
      );

      state.eventName = eventName;
      state.params = params;
      state.eventOptions = eventOptions;
    },

    destroyModifier({ element, eventName, callback, eventOptions }) {
      destroyListener(element, eventName, callback, eventOptions);
    }
  }),
  class OnModifier {}
);
