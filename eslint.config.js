import reactCompiler from 'eslint-plugin-react-compiler';
import tsEslint from 'typescript-eslint';

// npm i @typescript-eslint/parser typescript-eslint eslint-plugin-react-compiler eslint

export default [
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
    ignores: ['./dist/*', 'tailwind.config.ts', 'vite.config.ts'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Ensure you're using the correct tsconfig.json
        extraFileExtensions: ['.ts', '.tsx'], // Add support for TypeScript
      },
      parser: tsEslint.parser,
    },
    files: ['**/*.ts', '**/*.tsx'], // Ensure ESLint checks TypeScript files
  },
];
