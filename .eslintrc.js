// .eslintrc.js (at repo root)
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // point at both package-level tsconfigs
    project: [
      './apps/backend/tsconfig.json',
      './apps/frontend/tsconfig.json'
    ],
    tsconfigRootDir: __dirname,
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
      typescript: {},
    },
  },
  rules: {
    // your custom rules…
  },
}
