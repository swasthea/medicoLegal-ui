export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
    },
    plugins: {
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: ['**/dist/**', '**/dist-standalone/**', '**/node_modules/**', '**/.vite-backend-url'],
  },
]
