import type { ArgTypes } from '@storybook/addons';

export const getSpinnerArgTypes = (): ArgTypes => ({
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'size of spinner',
        defaultValue: '2rem',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '"2rem"',
            },
            category: 'props',
        },
        control: {
            type: 'text',
        },
    },
    spinnerColor: {
        name: 'spinnerColor',
        type: { name: 'string' },
        description: 'color of spinner',
        defaultValue: '#898995',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '#898995',
            },
            category: 'props',
        },
        control: {
            type: 'color',
        },
    },
    bgColor: {
        name: 'bgColor',
        type: { name: 'string' },
        description: 'background color of spinner with fixed 0.3 opacity',
        defaultValue: '#A7A9B2',
        table: {
            type: {
                summary: 'string',
            },
            defaultValue: {
                summary: '#A7A9B2',
            },
            category: 'props',
        },
        control: {
            type: 'color',
        },
    },
});
