import type { ArgTypes } from '@storybook/addons';

export const getNoticeAlertArgTypes = (): ArgTypes => ({
    group: {
        name: 'group',
        type: { name: 'string' },
        description: '',
        defaultValue: 'noticeBottomRight',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    position: {
        name: 'position',
        type: { name: 'string' },
        description: 'The position of notice alert.',
        defaultValue: 'bottom right',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"bottom right"',
            },
        },
        control: {
            type: 'select',
            options: ['top left', 'top right', 'bottom left', 'bottom right'],
        },
    },
});
