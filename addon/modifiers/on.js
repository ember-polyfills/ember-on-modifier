/* eslint no-param-reassign: ["error", { "props": false }] */

import Ember from 'ember';
import addEventListener from '../utils/add-event-listener';

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
        positional: [eventName, callback],
        named: eventOptions
      }
    ) {
      if (typeof eventName === 'string' && typeof callback === 'function')
        addEventListener(element, eventName, callback, eventOptions);

      state.element = element;
      state.eventName = eventName;
      state.callback = callback;
      state.eventOptions = eventOptions;
    },

    updateModifier(
      state,
      {
        positional: [eventName, callback],
        named: eventOptions
      }
    ) {
      if (
        typeof state.eventName === 'string' &&
        typeof state.callback === 'function'
      )
        state.element.removeEventListener(state.eventName, state.callback);

      if (typeof eventName === 'string' && typeof callback === 'function')
        addEventListener(state.element, eventName, callback, eventOptions);

      state.eventName = eventName;
      state.callback = callback;
      state.eventOptions = eventOptions;
    },

    destroyModifier({ element, eventName, callback }) {
      if (typeof eventName === 'string' && typeof callback === 'function')
        element.removeEventListener(eventName, callback);
    }
  }),
  class OnModifier {}
);
