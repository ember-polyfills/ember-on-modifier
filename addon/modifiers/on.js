/* eslint no-param-reassign: "off" */

import Ember from 'ember';
import addEventListener from '../utils/add-event-listener';
import { assert } from '@ember/debug';

const allowedEventOptions = ['captured', 'once', 'passive'];

function assertValidEventOptions(eventOptions) {
  return Object.keys(eventOptions).every(function(option) {
    const isValid = !option || allowedEventOptions.includes(option);
    assert(
      '`capture`, `once` or `passive` are only allowed as event options',
      isValid
    );
    return isValid;
  });
}

function setupListener(element, eventName, callback, eventOptions, params) {
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
      assertValidEventOptions(eventOptions);
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
      assertValidEventOptions(eventOptions);
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
