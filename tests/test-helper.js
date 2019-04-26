import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { __counts } from 'ember-on-modifier/modifiers/on';

let startingCounts;
QUnit.testStart(() => {
  startingCounts = __counts();
});

QUnit.assert.counts = function(
  expected,
  msg = `counters have incremented by ${JSON.stringify(expected)}`
) {
  const current = __counts();

  this.deepEqual(
    current,
    {
      adds: expected.adds + startingCounts.adds,
      removes: expected.removes + startingCounts.removes
    },
    msg
  );
};

setApplication(Application.create(config.APP));

start();
