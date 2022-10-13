import type { ArgTypes } from '@storybook/addons';

export const getTagArgTypes = (): ArgTypes => ({
    keyItem: {
        name: 'keyItem',
        type: { name: 'object' },
        description: '',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    valueItem: {
        name: 'valueItem',
        type: { name: 'object' },
        description: '',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    categoryItem: {
        name: 'categoryItem',
        type: { name: 'object' },
        description: '',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    deletable: {
        name: 'deletable',
        type: { name: 'boolean' },
        description: 'Deletable when true',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    outline: {
        name: 'outline',
        type: { name: 'boolean' },
        description: 'Outlined when true',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'selected when true',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Show error icon when true',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    errorMessage: {
        name: 'errorMessage',
        type: { name: 'string' },
        description: 'Error Message',
        defaultValue: 'This is error message.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for replace contents composed of key, value, category',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    categorySlot: {
        name: 'category',
        description: 'Slot for replace category item',
        defaultValue: '',
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
    keySlot: {
        name: 'key',
        description: 'Slot for replace key item',
        defaultValue: '',
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
    valueSlot: {
        name: 'value',
        description: 'Slot for replace value item',
        defaultValue: '',
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
    /* events */
    onDelete: {
        name: 'delete',
        description: 'Emitted when the deleted button is clicked',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
