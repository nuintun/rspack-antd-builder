/**
 * @module oxfmt
 */

import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 128,
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'none',
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 1
      }
    },
    {
      files: ['*.css', '*.less', '*.sass', '*.scss'],
      options: {
        singleQuote: false
      }
    }
  ],
  ignorePatterns: ['*.min.*', '/wwwroot', 'pnpm-*.yaml']
});
