import { test, skip } from 'qunit';
import { gte } from 'ember-compatibility-helpers';

export const onModifierPolyfilled = !gte('3.11.0-beta.1');

export const testIfOnModifierPolyfilled = onModifierPolyfilled ? test : skip;
