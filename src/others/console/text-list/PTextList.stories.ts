import {
    toRefs, reactive,
} from 'vue';

import { faker } from '@faker-js/faker';
import {
    text, object, array, withKnobs,
} from '@storybook/addon-knobs';


import PTextList from './PTextList.vue';

export default {
    title: 'Others/Console/Text List',
    component: PTextList,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PTextList },
    props: {
        items: {
            default: array('items', ['hi', 'hello']),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', ''),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', ''),
        },
        target: {
            default: text('target', ''),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props"></PTextList>
    </div>`,
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});


export const linkFormatter = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', ['hi', '', true, false, 0, 1, 'hello']),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', ''),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', ''),
        },
        target: {
            default: text('target', ''),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props" :linkFormatter="linkFormatter"></PTextList>
    </div>`,
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
            linkFormatter(d) {
                return d;
            },
        };
    },
});


export const objectArray = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', faker.datatype.array(10).map(() => ({
                name: faker.name.firstName(),
                phone: faker.phone.number(),
                group: faker.helpers.arrayElement([undefined, faker.random.word()]),
            }))),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', 'name'),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', ''),
        },
        target: {
            default: text('target', ''),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PTextList v-bind="$props"></PTextList>
    </div>`,
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});


export const defaultSlot = () => ({
    components: { PTextList },
    props: {
        items: {
            default: object('items', faker.datatype.array(10).map(() => ({
                name: faker.name.firstName(),
                phone: faker.phone.number(),
                group: faker.helpers.arrayElement([undefined, faker.random.word()]),
            }))),
        },
        delimiter: {
            default: text('delimiter', ', '),
        },
        subKey: {
            default: text('subKey', 'name'),
        },
        tag: {
            default: text('tag', 'span'),
        },
        link: {
            default: text('link', ''),
        },
        target: {
            default: text('target', ''),
        },
    },
    template: `
    <div style="width: 80vw;">
        <p>scopedSlot Props: <br>
            all props, <br>
            index,<br> 
            data( = items[index]), <br>
            value(exact value. it will be different from data only when subKey is given.)
        </p>
        <br><br><br><br>
        <PTextList v-bind="$props">
            <template #default="{value, index}">
                <span>[{{index + 1}}] {{value}}</span>
            </template>
            <template #delimiter="">
                <br>
            </template>
        </PTextList>
    </div>`,
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
