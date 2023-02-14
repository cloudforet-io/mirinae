import { ref } from 'vue';

import { action } from '@storybook/addon-actions';
import { select, text, boolean } from '@storybook/addon-knobs';

import PTableCheckModel from '@/feedbacks/modals/advanced/table-modal/PTableCheckModal.vue';
import { SizeMapping } from '@/feedbacks/modals/type';
import PButton from '@/inputs/buttons/button/PButton.vue';


export default {
    title: 'Feedbacks/Modals/Advanced/Table Check Modal',
    component: PTableCheckModel,
};

const data = {
    fields: ['name', 'phone', 'email'],
    sortable: true,
    sortBy: null,
    sortDesc: true,
    visible: false,
    items: [
        { name: 'stark', phone: '000-0000-0000', email: 'stark@marvel.com' },
    ],
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
    cancel: action('cancel'),
    confirm: action('confirm'),

};


export const modal = () => ({
    components: { PTableCheckModel, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">Open Modal</p-button>
<PTableCheckModel
    ref="modal"
    :size="size"
    :headerTitle="headerTitle"
    :subTitle="subTitle"
    :fields="fields"
    :items="items"
    :visible.sync="visible"
    themeColor="safe"

    @cancel="cancel"
    @close="close"
    @confirm="confirm"
    >
    
</PTableCheckModel>
</div>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        themeColor: {
            default: select('color', ['primary', 'alert', 'safe'], 'primary'),
        },
        size: {
            default: select('size', [null, ...Object.keys(SizeMapping)], null),
        },
        okDisabled: {
            default: boolean('ok disabled', false),
        },
        headerTitle: {
            default: text('header', 'this is header'),
        },
        subTitle: {
            default: text('sub', 'this is sub Title'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
    },
    setup() {
        const visible = ref(false);

        const click = () => {
            visible.value = true;
        };
        const close = () => {
            visible.value = false;
            action('close');
        };
        return {
            visible,
            click,
            close,
            ...actions,
        };
    },
});
