module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
    // ecmaFeatures: {
    //   experimentalObjectRestSpread: true
    // }
  },
  rules: {
    'no-console': 0,
    semi: [1, 'always'],
    quotes: [1, 'single', 'avoid-escape']
  }
};
