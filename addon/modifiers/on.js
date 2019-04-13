/* eslint no-param-reassign: "off" */

import Ember from 'ember';
import addEventListener from '../utils/add-event-listener';
import { assert } from '@ember/debug';
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

  if (typeof eventName === 'string' && typeof callback === 'function') {
    if (Array.isArray(params) && params.length > 0) {
      const _callback = callback;
      callback = function(...args) {
        return _callback.call(this, ...params, ...args);
      };
    }

    addEventListener(element, eventName, callback, eventOptions);
  }

  return callback;
}

function destroyListener(element, eventName, callback) {
  if (typeof eventName === 'string' && typeof callback === 'function')
    element.removeEventListener(eventName, callback);
}

export default Ember._setModifierManager(
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
      destroyListener(state.element, state.eventName, state.callback);
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

    destroyModifier({ element, eventName, callback }) {
      destroyListener(element, eventName, callback);
    }
  }),
  class OnModifier {}
);
