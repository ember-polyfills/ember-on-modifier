import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';

import require, { has } from 'require';

import Application from '../app';
import config from '../config/environment';
// import { __counts } from 'ember-on-modifier/modifiers/on';

let __counts = null;

if (has('ember-on-modifier/modifiers/on')) {
  __counts = require('ember-on-modifier/modifiers/on').__counts;
}

QUnit.testStart(() => {
  if (__counts !== null) {
    QUnit.config.current.testEnvironment._startingCounts = __counts();
  }
});

QUnit.assert.counts = function (
  expected,
  message = `counters have incremented by ${JSON.stringify(expected)}`
) {
  if (__counts === null) {
    this.ok(true, 'using upstream implementation, not asserting on counts');
    return;
  }

  const current = __counts();

  this.deepEqual(
    current,
    {
      adds:
        expected.adds +
        QUnit.config.current.testEnvironment._startingCounts.adds,
      removes:
        expected.removes +
        QUnit.config.current.testEnvironment._startingCounts.removes
    },
    message
  );
};

setApplication(Application.create(config.APP));

start();
