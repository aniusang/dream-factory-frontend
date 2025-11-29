import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    ignores: ['node_modules/**', 'dist/**', '*.config.js', '*.config.cjs']
  },
  {
    languageOptions: {
      globals: {
        // 浏览器环境全局变量
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Audio: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off',
      'no-unused-vars': 'warn',
      // 放宽一些Vue代码风格规则
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': 'warn',
      'vue/order-in-components': 'warn',
      'vue/require-explicit-emits': 'warn'
    }
  }
]
