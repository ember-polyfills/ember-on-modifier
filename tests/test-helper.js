import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { __counts } from 'ember-on-modifier/modifiers/on';

QUnit.testStart(() => {
  QUnit.config.current.testEnvironment._startingCounts = __counts();
});

QUnit.assert.counts = function(
  expected,
  msg = `counters have incremented by ${JSON.stringify(expected)}`
) {
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
    msg
  );
};

setApplication(Application.create(config.APP));

start();
