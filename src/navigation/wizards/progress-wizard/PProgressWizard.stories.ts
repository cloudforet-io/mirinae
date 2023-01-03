import { ref } from 'vue';

import { action } from '@storybook/addon-actions';
import { object, boolean, withKnobs } from '@storybook/addon-knobs';
import { VTooltip } from 'v-tooltip';

import PProgressWizard from '@/navigation/wizards/progress-wizard/PProgressWizard.vue';


export default {
    title: 'Navigation/Wizards/Progress Wizard',
    component: { PProgressWizard },
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A174372',
        },
    },
};

const actions = () => ({
    onChangeStep: action('changeStep'),
    onCancel: action('cancel'),
    onConfirm: action('confirm'),
});

const getProps = () => ({
    tabs: {
        default: object('tabs', [
            {
                name: 'conf',
                label: 'Configure Collector',
            },
            {
                name: 'credentials',
                label: 'Choose Credentials',
            },
            {
                name: 'tags',
                label: 'Add Tags',
                help: 'This is description of add tags step.',
            },
        ]),
    },
    invalidState: {
        default: object('invalidState', {}),
    },
    loading: {
        default: boolean('loading', false),
    },
    disabled: {
        default: boolean('disabled', false),
    },
});


export const progressWizard = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard v-bind="$props"
                                  :activeIdx.sync="activeIdx"
                                style="width: 100vw;"
                                @changeStep="onChangeStep"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'contents-' + tab.name"
                    >
                        <div style="background-color: mediumpurple; padding: 2rem;" :key="tab.name">
                            <h2 style="text-align: center;">
                                This is contents slot for '{{ tab.name }}' tab.

                                This component needs 'tabs' property with follow format: 
                                <pre>
                                    key: String (essential),
                                    label: String (recommended),
                                    alert: String (or warning),
                                    invalid: Boolean,
                                    help: Boolean,
                                    optional: Boolean,
                                </pre>
                            </h2>
                            <br>
                            <h4 v-for="(item, idx) in JSON.stringify(tab).split(',')"
                                :key="idx"
                            >
                                {{item}}<br>
                            </h4>
                            <br>
                            <p>* It has min height.</p>
                        </div>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const topSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template #top>
                        <h1 style="background-color: hotpink;">This is 'top' slot</h1>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const progressSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'progress-' + tab.name"
                    >
                        <div style="color: hotpink; padding: 2rem;" :key="'progress-'+tab.name">
                                This is progress slot for '{{ tab.name }}' tab.
                        </div>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});

export const helpSlot = () => ({
    components: { PProgressWizard },
    directives: { tooltip: VTooltip },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template v-for="(tab) in tabs"
                              :slot="'help-' + tab.name"
                    >
                          <button v-tooltip="{
                              content: 'You can use tooltip options for customizing this help message.',
                              placement: 'right',
                              classes: ['p-tooltip'],
                          }" class="p-tooltip">HOVER ME!</button>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});


export const stepAppendSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template slot="step-append-conf">
                        <button style="display: inline-block;">This is step append slot</button>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});


export const bottomSlot = () => ({
    components: { PProgressWizard },
    props: { ...getProps() },
    template: `<p-progress-wizard :tabs.sync="tabs"
                                :active-idx.sync="activeIdx"
                                style="width: 100vw;"
                                @cancel="onCancel"
                                @confirm="onConfirm"
                >
                    <template #bottom>
                        <h1 style="background-color: hotpink;">This is 'bottom' slot</h1>
                    </template>
                </p-progress-wizard>`,
    setup() {
        return {
            activeIdx: ref(0),
            ...actions(),
        };
    },
});
