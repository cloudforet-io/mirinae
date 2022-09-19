import type { ArgTypes } from '@storybook/addons';

export const getEmptyArgTypes = (): ArgTypes => ({
    /* slot */
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});
