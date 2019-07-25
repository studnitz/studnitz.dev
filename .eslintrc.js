module.exports = {
  root: true,
  extends: ['plugin:vue/recommended', 'prettier', 'prettier/vue'],
  // required to lint *.vue files
  plugins: ['vue', 'prettier'],
  // add your custom rules here
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'off',
    'vue/require-prop-types': 'off',
    'prettier/prettier': 'error',
  },
}
