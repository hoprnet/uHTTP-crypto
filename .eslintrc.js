module.exports = {
    env: {
        es2020: true,
        browser: true,
    },
    extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@stylistic', '@typescript-eslint'],
    root: true,
    rules: {
        '@stylistic/quotes': [
            'warn',
            'single',
            { avoidEscape: true, allowTemplateLiterals: false },
        ],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_ignored' },
        ],
        '@typescript-eslint/no-explicit-any': ['off'],
    },
};
