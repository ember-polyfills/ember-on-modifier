'use strict';

const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

const isIE = !!process.env.IE;
const isCI = !!process.env.CI;
const isProduction = process.env.EMBER_ENV === 'production';

if (isIE || isCI || isProduction) {
  browsers.push('ie 11');
}

module.exports = {
  browsers
};
