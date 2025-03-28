module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        'plugin:vue/vue3-recommended',
    ],
    "parserOptions": {
        "ecmaVersion": "2020",
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
        "vue/multi-workd-component-names":0,
        "vue/html-indent": 0
    }
};
