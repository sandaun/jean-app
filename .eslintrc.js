module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
    'react-native/react-native': true,
  },
  extends: ['@react-native', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
}
