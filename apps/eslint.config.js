import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['apps/backend/src/**/*.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './apps/backend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Your existing rules here
    },
  },
];