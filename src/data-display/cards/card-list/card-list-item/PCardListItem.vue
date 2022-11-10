<template>
    <div class="p-card-list-item" :class="{'rounded': rounded}">
        <div class="content-area">
            <div v-if="leftIcon" class="left-icon">
                <p-i :name="leftIcon"
                     width="2.5rem"
                     height="2.5rem"
                />
            </div>
            <div class="content">
                <slot name="content" />
            </div>
            <slot name="right-content-area">
                <div class="desktop-right-content-area">
                    <template v-for="(rightContentType, index) in state.rightButtonSet">
                        <div v-if="CARD_BUTTON_ICON_NAME_TYPE[rightContentType] === CARD_BUTTON_ICON_NAME_TYPE.CUSTOM"
                             :key="`${rightContentType}-${index}`"
                        >
                            <slot name="custom-right-content" />
                        </div>
                        <p-icon-button v-else
                                       :key="`${rightContentType}-${index}`"
                                       :name="CARD_BUTTON_ICON_NAME_TYPE[rightContentType]"
                                       @click="state.buttonHandlerMap[rightContentType]"
                        />
                    </template>
                </div>
                <div class="tab-right-content-area">
                    <p-select-dropdown v-if="state.rightButtonSet.length > 1"
                                       :items="state.rightButtonSet"
                                       style-type="icon-button"
                                       button-icon="ic_more"
                                       use-fixed-menu-style
                    >
                        <template #menu-menu>
                            <div class="custom-button-menu">
                                <template v-for="(rightContentType, index) in state.rightButtonSet">
                                    <div v-if="CARD_BUTTON_ICON_NAME_TYPE[rightContentType] !== CARD_BUTTON_ICON_NAME_TYPE.CUSTOM"
                                         :key="`${rightContentType}-${index}`"
                                    >
                                        <p-icon-button :name="CARD_BUTTON_ICON_NAME_TYPE[rightContentType]"
                                                       @click="state.buttonHandlerMap[rightContentType]"
                                        />
                                    </div>
                                    <div v-else :key="`${rightContentType}-${index}`">
                                        <slot name="custom-right-content" />
                                    </div>
                                </template>
                            </div>
                        </template>
                    </p-select-dropdown>
                    <p-icon-button v-else-if="state.rightButtonSet.length === 1 && CARD_BUTTON_ICON_NAME_TYPE[state.rightButtonSet[0]] !== CARD_BUTTON_ICON_NAME_TYPE.CUSTOM"
                                   :name="CARD_BUTTON_ICON_NAME_TYPE[state.rightButtonSet[0]]"
                                   @click="state.buttonHandlerMap[state.rightButtonSet[0]]"
                    />
                    <slot v-else name="custom-right-content" />
                </div>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import type { PropType } from 'vue';

import { CARD_BUTTON_ICON_NAME_TYPE } from '@/data-display/cards/card-list/card-list-item/type';
import type { RightContentType, CardListItemProps, ButtonEventHandlerMap } from '@/data-display/cards/card-list/card-list-item/type';
import PI from '@/foundation/icons/PI.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';

export default defineComponent<CardListItemProps>({
    name: 'PCardListItem',
    components: { PIconButton, PSelectDropdown, PI },
    props: {
        leftIcon: {
            type: String,
            default: undefined,
        },
        rightButtonSet: {
            type: Array as PropType<RightContentType[]>,
            default: undefined,
            // default: () => ['EDIT', 'DUPLICATE', 'TRASHCAN'],
        },
        buttonHandlerMap: {
            type: Object,
            default: () => ({}),
        },
        isSelected: {
            type: Boolean,
            default: undefined,
        },
        rounded: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            rightButtonSet: computed(() => props.rightButtonSet ?? []),
            buttonHandlerMap: computed(() => props.buttonHandlerMap ?? getEventHandlerMap(state.rightButtonSet)),
        });

        const getEventHandlerMap = (buttonTypeSet: RightContentType[]) => {
            const result = {} as ButtonEventHandlerMap;
            buttonTypeSet.forEach((d) => {
                result[d] = () => {};
            });
            return result;
        };

        return {
            state,
            CARD_BUTTON_ICON_NAME_TYPE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.p-card-list-item {
    @apply flex items-center bg-white border border-gray-200 relative;
    padding: 1rem;
    min-height: 4rem;
    box-sizing: border-box;
    &.rounded {
        @apply rounded-md;
    }

    &:hover {
        @apply bg-blue-100;
    }

    .content-area {
        @apply w-full h-full flex items-center overflow-hidden;
        .content {
            @apply flex-grow;
        }
        .desktop-right-content-area {
            @apply h-full flex items-center bg-blue-100 absolute;
            right: 1rem;
        }
        .tab-right-content-area {
            @apply h-full flex items-center bg-blue-100 absolute;
            right: 1rem;
            display: none;
            .custom-button-menu {
                padding: 0.5rem;
            }
        }
        .left-icon {
            @apply h-full;
            margin-right: 0.75rem;
        }
    }

    &:not(:hover) {
        .desktop-right-content-area {
            display: none;
        }
    }

    @screen tablet {
        .content-area {
            .desktop-right-content-area {
                display: none;
            }
            .tab-right-content-area {
                display: flex;
            }
        }
        &:not(:hover) {
            .tab-right-content-area {
                display: none;
            }
        }
    }
}
</style>
