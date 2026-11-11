import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', 'reports/'] },
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-skipped-test': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.property.name='describe'][property.name='serial']",
          message: 'Tests must be independent: test.describe.serial is not allowed.',
        },
        {
          selector:
            "CallExpression[callee.property.name='configure'] Property[key.name='mode'][value.value='serial']",
          message: 'Tests must be independent: serial mode is not allowed.',
        },
      ],
    },
  },
  prettier,
);
