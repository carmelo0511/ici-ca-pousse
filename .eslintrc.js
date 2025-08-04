module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Désactiver temporairement les règles problématiques pour les tests
    'testing-library/no-node-access': 'off',
    'no-unused-vars': 'warn',
    'default-case': 'warn'
  },
  overrides: [
    {
      files: ['src/tests/**/*.{js,jsx}'],
      rules: {
        'testing-library/no-node-access': 'off',
        'no-unused-vars': 'off'
      }
    }
  ]
}; 