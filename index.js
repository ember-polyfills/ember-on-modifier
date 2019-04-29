'use strict';

const Funnel = require('broccoli-funnel');

module.exports = {
  name: require('./package').name,

  included(...args) {
    this._super.included.apply(this, args);

    this.hasEventHelpers = Boolean(
      this.project.findAddonByName('ember-event-helpers')
    );
  },

  treeForApp(...args) {
    return this.filterTree(this._super.treeForApp.apply(this, args));
  },

  treeForAddon(...args) {
    return this.filterTree(this._super.treeForAddon.apply(this, args));
  },

  filterTree(tree) {
    if (this.hasEventHelpers) {
      return new Funnel(tree, { exclude: [/helpers/] });
    }

    return tree;
  }
};
