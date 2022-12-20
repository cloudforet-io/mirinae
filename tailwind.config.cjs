const _ = require('lodash');
const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');
const colors = require('./src/styles/colors.cjs').tailwindColors;
const screens = require('./src/styles/screens.cjs');
const semanticFontSize = require('./src/styles/font-size.cjs');

const rawSize = Array(32)
    .fill('')
    .map((value, idx) => [`${idx}`, `${idx * 0.25}rem`]);
const size = _.fromPairs(rawSize);

const rawPercent = [
    '1/2',
];

const percent = _.fromPairs(rawPercent.map((value) => [value, `${eval(value) * 100}%`]));
module.exports = {
    theme: {
        borderRadius: {
            none: '0',
            '2xs': '0.063rem', // 1px
            xs: '0.125rem', // 2px
            sm: '0.188rem', // 3px
            md: '0.25rem', // 4px
            default: '0.25rem', // 4px
            lg: '0.375rem', // 6px
            xl: '0.5rem', // 8px
            '2xl': '0.75rem', // 12px
            full: '9999px',
        },
        colors,
        spacing: {
            ...defaultTheme.spacing,
            px: '1px',
            ...size,
        },
        minWidth: (theme) => ({
            ...defaultTheme.minWidth,
            ...theme('spacing'),
            ...percent,
            '2xs': theme('screens.2xs.min'),
            xs: theme('screens.xs.min'),
            sm: theme('screens.sm.min'),
            md: theme('screens.md.min'),
            lg: theme('screens.lg.min'),
            xl: theme('screens.xl.min'),
            '2xl': theme('screens.2xl.min'),
            '3xl': theme('screens.3xl.min'),
        }),
        maxWidth: (theme, args) => ({
            ...defaultTheme.maxWidth(theme, args),
            ...theme('spacing'),
            ...percent,
            mobile: theme('screens.mobile.max'),
            tablet: theme('screens.tablet.max'),
            laptop: theme('screens.laptop.max'),
            desktop: theme('screens.desktop.max'),
        }),
        minHeight: (theme) => ({
            ...defaultTheme.minHeight,
            ...theme('spacing'),
            ...percent,
        }),
        maxHeight: (theme) => ({
            ...defaultTheme.maxHeight,
            ...theme('spacing'),
            ...percent,
        }),
        fontFamily: {
            sans: ['Noto Sans'],
            serif: ['Roboto'],
        },
        screens: {
            '2xs': { min: '375px' },
            xs: { min: '478px' },
            sm: { min: '576px' },
            md: { min: '768px' },
            lg: { min: '1024px' },
            xl: { min: '1440px' },
            '2xl': { min: '1920px' },
            '3xl': { min: '2560px' },
            mobile: { max: `${screens.mobile.max}px` },
            tablet: { max: `${screens.tablet.max}px` },
            laptop: { max: `${screens.laptop.max}px` },
            desktop: { max: `${screens.desktop.max}px` },
        },
        fontSize: {
            ...semanticFontSize.fontSize,
            'display-2xl': semanticFontSize.semanticFont["display-2xl"],
            'display-xl': semanticFontSize.semanticFont["display-xl"],
            'display-lg': semanticFontSize.semanticFont["display-lg"],
            'display-md': semanticFontSize.semanticFont["display-md"],
            'display-sm': semanticFontSize.semanticFont["display-sm"],
            'label-xl': semanticFontSize.semanticFont["label-xl"],
            'label-lg': semanticFontSize.semanticFont["label-lg"],
            'label-md': semanticFontSize.semanticFont["label-md"],
            'label-sm': semanticFontSize.semanticFont["label-sm"],
            'label-xs': semanticFontSize.semanticFont["label-xs"],
            'paragraph-md': semanticFontSize.semanticFont["paragraph-md"],
            'paragraph-sm': semanticFontSize.semanticFont["paragraph-sm"],
            'code-lg': semanticFontSize.semanticFont["code-lg"],
            'code-md': semanticFontSize.semanticFont["code-md"],
        },
    },
    variants: ['responsive', 'important', 'hover'],
    plugins: [
        plugin(({ addVariant }) => {
            addVariant('important', ({ container }) => {
                container.walkRules((rule) => {
                    rule.selector = `.\\!${rule.selector.slice(1)}`;
                    rule.walkDecls((decl) => {
                        decl.important = true;
                    });
                });
            });
        }),
    ],
};
