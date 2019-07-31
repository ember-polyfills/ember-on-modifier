import { test, skip } from 'qunit';

import config from 'dummy/config/environment';

export const { EMBER_EVENT_HELPERS_INSTALLED } = config;

export const testIfEventHelpersInstalled = EMBER_EVENT_HELPERS_INSTALLED
  ? test
  : skip;
export const skipIfEventHelpersInstalled = EMBER_EVENT_HELPERS_INSTALLED
  ? skip
  : test;
