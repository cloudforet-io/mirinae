import type { ArgTypes } from '@storybook/addons';
import icon from 'vue-svgicon';

import { cardListItemButtonSet, getButtonEventHandlerMap } from '@/data-display/cards/card-list/card-list-item/mock';

export const getCardListItemArgTypes = (): ArgTypes => ({
    leftIcon: {
        name: 'leftIcon',
        type: { name: 'string' },
        description: 'Icon name in Left Content Area.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'ic_refresh',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(icon.icons),
        },
    },
    rightButtonSet: {
        name: 'rightButtonSet',
        type: { name: 'array' },
        description: 'Array of button types that will fit into the right content area. In case of `CUSTOM`, you can use custom content using `custom-right-content` slot.',
        defaultValue: cardListItemButtonSet,
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
    },
    buttonHandlerMap: {
        name: 'buttonHandlerMap',
        type: { name: 'object' },
        description: 'Button event handlers',
        defaultValue: getButtonEventHandlerMap(cardListItemButtonSet),
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
    },
    rounded: {
        name: 'rounded',
        type: { name: 'boolean' },
        description: 'Use `border-radius` style of the card item.',
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
    // slots
    // defaultSlot: {
    //     name: 'default',
    //     type: { name: 'string' },
    //     description: 'Slot to replace icon',
    //     defaultValue: 'button',
    //     table: {
    //         type: {
    //             summary: null,
    //         },
    //         category: 'slots',
    //     },
    //     control: {
    //         type: 'text',
    //     },
    // },
});
