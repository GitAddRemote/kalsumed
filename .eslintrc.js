// .eslintrc.js
module.exports = {
  root: true,

  // Use the TypeScript parser
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './apps/backend/tsconfig.json',
      './apps/frontend/tsconfig.json'
      // If you ever add a root tsconfig.json, include it here:
      // './tsconfig.json'
    ],
    sourceType: 'module',
  },

  plugins: [
    '@typescript-eslint',
    'import',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
  ],

  env: {
    node: true,
    es6: true,
    browser: true,
    jest: true,
  },

  settings: {
    'import/resolver': {
      typescript: {
        // Point the resolver at each package's tsconfig
        project: [
          './apps/backend/tsconfig.json',
          './apps/frontend/tsconfig.json'
        ],
      },
    },
  },

  rules: {
    // Example overrides—you can customize these
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
};
