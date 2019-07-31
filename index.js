'use strict';

const Funnel = require('broccoli-funnel');
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  included(...args) {
    this._super.included.apply(this, args);

    const checker = new VersionChecker(this.project);
    const ember = checker.forEmber();

    this.hasNativeOnModifier = ember.gte('3.11.0-beta.1');

    this.hasEventHelpers = Boolean(
      this.project.findAddonByName('ember-event-helpers')
    );

    if (this.hasNativeOnModifier && this.parent === this.project) {
      let message =
        'The `{{on}}` modifier is available natively since Ember 3.11.0-beta.1. You can remove `ember-on-modifier` from your `package.json`.';

      if (!this.hasEventHelpers) {
        message +=
          ' If you use the `(prevent-default)` helper, please install `ember-event-helpers`.';
      }

      this.ui.writeDeprecateLine(message);
    }
  },

  treeForApp(...args) {
    return this.filterTree(this._super.treeForApp.apply(this, args));
  },

  treeForAddon(...args) {
    return this.filterTree(this._super.treeForAddon.apply(this, args));
  },

  filterTree(tree) {
    const exclude = [];

    if (this.hasNativeOnModifier) {
      exclude.push(/modifiers/);
    }
    if (this.hasEventHelpers) {
      exclude.push(/helpers/);
    }

    return new Funnel(tree, { exclude });
  }
};
