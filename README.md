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

An implementation of the `{{on}}` element modifier shown in the [Modifiers RFC
#353](https://github.com/emberjs/rfcs/pull/353). Heavily inspired by
[`@ember/render-modifiers`](https://github.com/emberjs/ember-render-modifiers).

## Installation

```
ember install ember-on-modifier
```

#### Compatibility

- Ember.js v2.18 or above
- ember-cli v2.13 or above

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
component instance. Alternatively, you can use the [`{{action}}`][action-helper]
or [`{{bind}}`][bind-helper] helper in the template.

[@action]: https://ember-decorators.github.io/ember-decorators/docs/api/modules/@ember-decorators/object#action
[action-helper]: https://www.emberjs.com/api/ember/release/classes/Ember.Templates.helpers/methods/action?anchor=action
[bind-helper]: https://github.com/Serabe/ember-bind-helper

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

#### Internet Explorer 11 Support

Internet Explorer 11 has a buggy and incomplete implementation of
`addEventListener`: It does not accept an
[`options`][addeventlistener-parameters] parameter and _sometimes_ even throws
a cryptic error when passing options.

This is why this addon ships a tiny [ponyfill][ponyfill] for `addEventLisener`
that is used internally to emualte the `once` option and discard any other
options. This means that any [`options`][addeventlistener-parameters] other than
[`once`][addeventlistener-parameters] will have _no effect in IE11_, so do not
rely on them in your logic, if you need to support IE11.

[ponyfill]: https://github.com/sindresorhus/ponyfill

### Currying / Partial Application

If you want to curry the function call / partially apply arguments, you can do
so using the [`{{action}}`][action-helper] or [`{{bind}}`][bind-helper] helper:

```hbs
{{#each this.users as |user|}}
  <button {{on "click" (action this.deleteUser user)}}>
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

### `preventDefault`

This addon ships a `prevent-default` template helper, that you can use like
this:

```hbs
<a href="/" {{on "click" (prevent-default this.someAction)}}>Click me</a>
```

```hbs
<a href="/" {{on "click" this.someAction}} {{on "click" (prevent-default)}}>Click me</a>
```

This is effectively the same as calling `event.preventDefault()` in your event
handler or using the [`{{action}}` modifier][action-event-propagation]
like this:

```hbs
<a href="/" {{action this.someAction preventDefault=true}}>Click me</a>
```

[action-event-propagation]: https://www.emberjs.com/api/ember/release/classes/Ember.Templates.helpers/methods/action?anchor=action#event-propagation
