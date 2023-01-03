import { withKnobs } from '@storybook/addon-knobs';

import PVerticalLayout from '@/layouts/vertical-layout/PVerticalLayout.vue';

export default {
    title: 'Layouts/VerticalLayout',
    component: PVerticalLayout,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PVerticalLayout },
        },
    },
};

export const verticalLayout = () => ({
    components: { PVerticalLayout },
    template: `
        <div style="width: 100vw; height: 10rem; border: 1px solid gray;">
            <p-vertical-layout>
                <template #sidebar>
                    Left Layout
                </template>
                <template #default>
                    Right Layout
                </template>
            </p-vertical-layout>
        </div>`,
});
