module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "globals": {
    "process": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "accessor-pairs": "error",
    "array-bracket-spacing": [
      "error",
      "never"
    ],
    "array-callback-return": "off",
    "arrow-body-style": "error",
    "arrow-parens": [
      "error",
      "always"
    ],
    "arrow-spacing": [
      "error",
      {
        "after": true,
        "before": true
      }
    ],
    "block-scoped-var": "error",
    "block-spacing": "error",
    "brace-style": [
      "error",
      "1tbs"
    ],
    "callback-return": "off",
    "camelcase": "off",
    "class-methods-use-this": "error",
    "comma-dangle": "off",
    "comma-spacing": [
      "error",
      {
        "after": true,
        "before": false
      }
    ],
    "comma-style": [
      "error",
      "last"
    ],
    "complexity": "off",
    "computed-property-spacing": [
      "error",
      "never"
    ],
    "consistent-return": "off",
    "consistent-this": "off",
    "curly": "error",
    "default-case": "off",
    "dot-location": [
      "error",
      "property"
    ],
    "dot-notation": "off",
    "eol-last": "off",
    "eqeqeq": "off",
    "func-call-spacing": "error",
    "func-name-matching": "error",
    "func-names": "off",
    "func-style": "off",
    "generator-star-spacing": "error",
    "global-require": "off",
    "guard-for-in": "off",
    "handle-callback-err": "off",
    "id-blacklist": "error",
    "id-length": "off",
    "id-match": "error",
    "indent": "off",
    "init-declarations": "off",
    "jsx-quotes": "error",
    "key-spacing": "error",
    "keyword-spacing": [
      "error",
      {
        "after": true,
        "before": true
      }
    ],
    "line-comment-position": "off",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "lines-around-comment": "off",
    "lines-around-directive": "off",
    "max-depth": "error",
    "max-len": "off",
    "max-lines": "off",
    "max-nested-callbacks": "error",
    "max-params": "off",
    "max-statements": "off",
    "max-statements-per-line": "error",
    "multiline-ternary": "off",
    "new-parens": "off",
    "newline-after-var": "off",
    "newline-before-return": "off",
    "newline-per-chained-call": "off",
    "no-alert": "error",
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-catch-shadow": "error",
    "no-confusing-arrow": "error",
    "no-continue": "off",
    "no-div-regex": "error",
    "no-duplicate-imports": "error",
    "no-else-return": "off",
    "no-empty": ["error", {
      allowEmptyCatch: true
    }],
    "no-empty-function": "off",
    "no-eq-null": "off",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-extra-parens": "off",
    "no-floating-decimal": "error",
    "no-implicit-coercion": [
      "error",
      {
        "boolean": false,
        "number": false,
        "string": false
      }
    ],
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-inline-comments": "off",
    "no-invalid-this": "off",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "error",
    "no-lone-blocks": "off",
    "no-lonely-if": "off",
    "no-loop-func": "error",
    "no-magic-numbers": "off",
    "no-mixed-operators": "off",
    "no-mixed-requires": "error",
    "no-multi-spaces": "off",
    "no-multi-str": "error",
    "no-multiple-empty-lines": "error",
    "no-native-reassign": "error",
    "no-negated-condition": "off",
    "no-negated-in-lhs": "error",
    "no-nested-ternary": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "off",
    "no-path-concat": "error",
    "no-plusplus": "off",
    "no-process-env": "error",
    "no-process-exit": "error",
    "no-proto": "error",
    "no-prototype-builtins": "off",
    "no-restricted-globals": "error",
    "no-restricted-imports": "error",
    "no-restricted-modules": "error",
    "no-restricted-properties": "error",
    "no-restricted-syntax": "error",
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "off",
    "no-shadow-restricted-names": "error",
    "no-spaced-func": "error",
    "no-sync": "error",
    "no-tabs": "error",
    "no-template-curly-in-string": "error",
    "no-ternary": "off",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "off",
    "no-unused-expressions": "off",
    "no-use-before-define": "off",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "off",
    "no-useless-constructor": "error",
    "no-useless-escape": "off",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "off",
    "no-void": "off",
    "no-warning-comments": [
      "error",
      {
        "location": "start"
      }
    ],
    "no-whitespace-before-property": "error",
    "no-with": "error",
    "object-curly-newline": "off",
    "object-curly-spacing": [
      "error",
      "never"
    ],
    "object-property-newline": "off",
    "object-shorthand": "off",
    "one-var": "off",
    "one-var-declaration-per-line": "off",
    "operator-assignment": "off",
    "operator-linebreak": [
      "error",
      null
    ],
    "padded-blocks": "off",
    "prefer-arrow-callback": "off",
    "prefer-const": "off",
    "prefer-numeric-literals": "error",
    "prefer-reflect": "off",
    "prefer-rest-params": "off",
    "prefer-spread": "off",
    "prefer-template": "off",
    "quote-props": "off",
    "quotes": "off",
    "radix": "off",
    "require-jsdoc": "off",
    "rest-spread-spacing": "error",
    "semi": "off",
    "semi-spacing": [
      "error",
      {
        "after": true,
        "before": false
      }
    ],
    "sort-imports": "error",
    "sort-keys": "off",
    "sort-vars": "off",
    "space-before-blocks": "error",
    "space-before-function-paren": "error",
    "space-in-parens": "off",
    "space-infix-ops": "error",
    "space-unary-ops": [
      "error",
      {
        "nonwords": false,
        "words": false
      }
    ],
    "spaced-comment": "off",
    "strict": "off",
    "symbol-description": "error",
    "template-curly-spacing": "error",
    "unicode-bom": [
      "error",
      "never"
    ],
    "valid-jsdoc": "error",
    "vars-on-top": "off",
    "wrap-iife": [
      "error",
      "any"
    ],
    "wrap-regex": "off",
    "yield-star-spacing": "error"
  }
};