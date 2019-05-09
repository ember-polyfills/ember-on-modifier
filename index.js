'use strict';

const VersionChecker = require('ember-cli-version-checker');
const Funnel = require('broccoli-funnel');

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

    if (
      this.hasNativeOnModifier &&
      this.hasEventHelpers &&
      this.parent === this.project
    ) {
      this.ui.writeDeprecateLine(
        'ember-on-modifier is no longer needed in your project. It can be removed from package.json.'
      );
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

    if (this.hasOnModifier) {
      exclude.push(/modifiers/);
    }
    if (this.hasEventHelpers) {
      exclude.push(/helpers/);
    }

    return new Funnel(tree, { exclude });
  }
};
