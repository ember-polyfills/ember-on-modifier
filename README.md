# ember-on-modifier

[![Build Status](https://travis-ci.org/buschtoens/ember-on-modifier.svg)](https://travis-ci.org/buschtoens/ember-on-modifier)
[![npm version](https://badge.fury.io/js/ember-on-modifier.svg)](http://badge.fury.io/js/ember-on-modifier)
[![Download Total](https://img.shields.io/npm/dt/ember-on-modifier.svg)](http://badge.fury.io/js/ember-on-modifier)
[![Ember Observer Score](https://emberobserver.com/badges/ember-on-modifier.svg)](https://emberobserver.com/addons/ember-on-modifier)
[![Ember Versions](https://img.shields.io/badge/Ember.js%20Versions-%5E2.18%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/buschtoens/ember-on-modifier)
[![ember-cli Versions](https://img.shields.io/badge/ember--cli%20Versions-%5E2.13%20%7C%7C%20%5E3.0-brightgreen.svg)](https://travis-ci.org/buschtoens/ember-on-modifier)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/buschtoens/ember-on-modifier.svg)](https://david-dm.org/buschtoens/ember-on-modifier)
[![devDependencies](https://img.shields.io/david/dev/buschtoens/ember-on-modifier.svg)](https://david-dm.org/buschtoens/ember-on-modifier)

A polyfill for the `{{on}}` element modifier specified by
[RFC #471 "`{{on}}` modifier"](https://github.com/emberjs/rfcs/blob/master/text/0471-on-modifier.md).

## Installation

```
ember install ember-on-modifier
```

## Compatibility

* Completely inert when running `ember-source` 3.11 or higher
* Tested against `ember-source` v2.13, v2.18, v3.4 in CI

## Usage

```hbs
<button {{on "click" this.onClick}}>
  Click me baby, one more time!
</button>
```

```ts
import Component from '@ember/component';
import { action } from '@ember-decorators/object';

export default class BritneySpearsComponent extends Component {
  @action
  onClick(event: MouseEvent) {
    console.log('I must confess, I still believe.');
  }
}
```

The [`@action` decorator][@action] is used to bind the `onClick` method to the
component instance.

[@action]: https://github.com/emberjs/rfcs/blob/master/text/0408-decorators.md#method-binding

This is essentially equivalent to:

```ts
didInsertElement() {
  super.didInsertElement();

  const button = this.element.querySelector('button');
  button.addEventListener('click', this.onClick);
}
```

In addition to the above `{{on}}` will properly tear down the event listener,
when the element is removed from the DOM. It will also re-register the event
listener, if any of the passed parameters change.

### Listening to Multiple Events

You can use the `{{on}}` modifier multiple times on the same element, even for
the same event.

```hbs
<button
  {{on "click" this.onClick}}
  {{on "click" this.anotherOnClick}}
  {{on "mouseover" this.onMouseEnter}}
>
  Click me baby, one more time!
</button>
```

### Event Options

All named parameters will be passed through to
[`addEventListener`][addeventlistener] as the third parameter, the options hash.

[addeventlistener]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

```hbs
<div {{on "scroll" this.onScroll passive=true}}>
  Lorem Ipsum ...
</div>
```

This is essentially equivalent to:

```ts
didInsertElement() {
  super.didInsertElement();

  const div = this.element.querySelector('div');
  div.addEventListener('scroll', this.onScroll, { passive: true });
}
```

#### `once`

To fire an event listener only once, you can pass the [`once` option][addeventlistener-parameters]:

```hbs
<button
  {{on "click" this.clickOnlyTheFirstTime once=true}}
  {{on "click" this.clickEveryTime}}
>
  Click me baby, one more time!
</button>
```

`clickOnlyTheFirstTime` will only be fired the first time the button is clicked.
`clickEveryTime` is fired every time the button is clicked, including the first
time.

[addeventlistener-parameters]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters

#### `capture`

To listen for an event during the capture phase already, use the [`capture` option][addeventlistener-parameters]:

```hbs
<div {{on "click" this.triggeredFirst capture=true}}>
  <button {{on "click" this.triggeredLast}}>
    Click me baby, one more time!
  </button>
</div>
```

#### `passive`

If `true`, you promise to not call `event.preventDefault()`. This allows the
browser to optimize the processing of this event and not block the UI thread.
This prevent scroll jank.

If you still call `event.preventDefault()`, an assertion will be raised.

```hbs
<div {{on "scroll" this.trackScrollPosition passive=true}}>
  Lorem ipsum...
</div>
```

#### Internet Explorer 11 Support

Internet Explorer 11 has a buggy and incomplete implementation of
`addEventListener`: It does not accept an
[`options`][addeventlistener-parameters] parameter and _sometimes_ even throws
a cryptic error when passing options.

This is why this addon ships a tiny [ponyfill][ponyfill] for `addEventLisener`
that is used internally to emulate the `once`, `capture` and `passive` option.
This means that all currently known [`options`][addeventlistener-parameters] are
polyfilled, so that you can rely on them in your logic.

[ponyfill]: https://github.com/sindresorhus/ponyfill

### Currying / Partial Application

If you want to curry the function call / partially apply arguments, you can do
so using the [`{{fn}}` helper][fn-helper]:

[fn-helper]: https://github.com/emberjs/rfcs/blob/master/text/0470-fn-helper.md

```hbs
{{#each this.users as |user|}}
  <button {{on "click" (fn this.deleteUser user)}}>
    Delete {{user.name}}
  </button>
{{/each}}
```

```ts
import Component from '@ember/component';
import { action } from '@ember-decorators/object';

interface User {
  name: string;
}

export default class UserListComponent extends Component {
  users: User[] = [{ name: 'Tom Dale' }, { name: 'Yehuda Katz' }];

  @action
  deleteUser(user: User, event: MouseEvent) {
    event.preventDefault();
    this.users.removeObject(user);
  }
}
```

### `preventDefault` / `stopPropagation` / `stopImmediatePropagation`

The old [`{{action}}` modifier][action-event-propagation] used to allow easily
calling `event.preventDefault()` like so:

```hbs
<a href="/" {{action this.someAction preventDefault=true}}>Click me</a>
```

[action-event-propagation]: https://www.emberjs.com/api/ember/release/classes/Ember.Templates.helpers/methods/action?anchor=action#event-propagation

You also could easily call `event.stopPropagation()` to avoid bubbling like so:

```hbs
<a href="/" {{action this.someAction bubbles=false}}>Click me</a>
```

You can still do this using [`ember-event-helpers`][ember-event-helpers]:

[ember-event-helpers]: https://github.com/buschtoens/ember-event-helpers

```hbs
<a href="/" {{on "click" (prevent-default this.someAction)}}>Click me</a>
```

```hbs
<a href="/" {{on "click" (stop-propagation this.someAction)}}>Click me</a>
```

## Related Projects

- **[`ember-on-helper`][ember-on-helper]:** A complimentary `{{on}` template
  helper that accepts arbitrary event targets.

  ```hbs
  {{on eventTarget eventName eventListener}}
  ```

  Also ships with two convenience helpers for adding event listeners to
  `document` and `window`:

  ```hbs
  {{on-document eventName eventListener}}
  {{on-window eventName eventListener}}
  ```

[ember-on-helper]: https://github.com/buschtoens/ember-on-helper
