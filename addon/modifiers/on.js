import Ember from 'ember';

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
      element.addEventListener(eventName, callback, eventOptions);

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
      state.element.removeEventListener(state.eventName, state.callback);
      state.element.addEventListener(eventName, callback, eventOptions);

      state.eventName = eventName;
      state.callback = callback;
      state.eventOptions = eventOptions;
    },

    destroyModifier({ element, eventName, callback }) {
      element.removeEventListener(eventName, callback);
    }
  }),
  class OnModifier {}
);
