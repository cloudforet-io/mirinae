import { ref } from 'vue';

import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';

import PButton from '@/inputs/buttons/button/PButton.vue';
import PDoubleCheckModal from '@/others/console/modals/double-check-modal/PDoubleCheckModal.vue';

export default {
    title: 'Others/Console/Double Check Modal',
    component: PDoubleCheckModal,
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
    cancel: action('cancel'),
    confirm: action('confirm'),
};


export const modal = () => ({
    components: { PDoubleCheckModal, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">Open Modal</p-button>
<PDoubleCheckModal
    :headerTitle="headerTitle"
    :subTitle="subTitle"
    :visible.sync="visible"
    :verificationText="verificationText"

    @cancel="cancel"
    @close="close"
    @confirm="confirm"
    >
    
</PDoubleCheckModal>
</div>`,
    props: {
        headerTitle: {
            default: text('header', 'this is header'),
        },
        subTitle: {
            default: text('sub', 'this is sub Title'),
        },
        verificationText: {
            default: text('verification Text', 'verification'),
        },

    },
    setup() {
        const visible = ref(false);
        return {
            visible,
            click() {
                visible.value = true;
            },
            close() {
                visible.value = false;
                action('close');
            },
            ...actions,
        };
    },
});
