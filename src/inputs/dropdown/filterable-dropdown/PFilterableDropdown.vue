<template>
    <div v-on-click-outside="forceHideMenu"
         class="p-filterable-dropdown"
         :class="[ {'multi-selectable' : props.multiSelectable} ]"
    >
        <p-search ref="targetRef"
                  :value="state.proxyValue"
                  :placeholder="state.placeholderValue ? state.placeholderValue : $t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER')"
                  disable-icon
                  :is-focused.sync="state.proxyIsFocused"
                  :invalid="invalid"
                  :disabled="disabled"
                  :readonly="readonly"
                  @delete="onDeleteSearchText"
                  @click.native.stop="handleClick"
                  @search="onSearch"
                  @input="onInput"
                  @keyup.native="handleSearchKeyup"
                  @focus="handleSearchFocus"
        >
            <div v-if="state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.radioButton &&
                     state.proxySelected.length &&
                     !state.proxyVisibleMenu &&
                     !state.proxyIsFocused"
                 class="selected-radio-label"
            >
                <span><slot name="selected-radio-label"
                            :selected="state.proxySelected[0]"
                >{{ state.proxySelected[0].label || state.proxySelected[0].name }}</slot></span>
                <p-i class="delete-icon"
                     name="ic_delete"
                     height="1rem"
                     width="1rem"
                     @click="onDeleteTag(state.proxySelected[0], 0)"
                />
            </div>
            <slot name="selected-extra"
                  v-bind="{items: state.proxySelected}"
            />
            <template v-if="multiSelectable && state.proxySelected.length"
                      #left
            >
                <p-tag v-for="(selectedItem, index) in state.proxySelected"
                       :key="`tag-box-${index}`"
                       :deletable="!disabled"
                       @delete="onDeleteTag(selectedItem, index)"
                >
                    {{ selectedItem.label || selectedItem.name }}
                </p-tag>
                <p-i v-if="!disableDeleteAll"
                     class="delete-icon"
                     name="ic_delete"
                     height="1rem"
                     width="1rem"
                     @click="onDeleteAllTags"
                />
            </template>
            <template v-if="state.filterableDropdownType !== FILTERABLE_DROPDOWN_TYPE.default || !state.proxySelected.length || props.visibleMenu"
                      #right
            >
                <p-i :name="state.proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                     color="inherit"
                     class="dropdown-button"
                     :class="disabled"
                     @click.stop="handleClickDropdownButton"
                />
            </template>
            <template v-for="(_, slot) of state.searchSlots"
                      #[slot]="scope"
            >
                <slot :name="`search-${slot}`"
                      v-bind="{...scope}"
                />
            </template>
        </p-search>
        <p-context-menu v-show="state.proxyVisibleMenu"
                        ref="menuRef"
                        :menu="state.bindingMenu"
                        :loading="loading"
                        :readonly="readonly"
                        :strict-select-mode="strictSelectMode"
                        :selected.sync="state.proxySelected"
                        :multi-selectable="multiSelectable"
                        :show-select-header="multiSelectable"
                        :show-radio-icon="state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.radioButton"
                        :style="{...contextMenuStyle, maxWidth: contextMenuStyle.minWidth, width: contextMenuStyle.minWidth}"
                        :class="state.filterableDropdownType"
                        @select="handleSelectMenuItem"
                        @keyup:up:end="focusSearch"
                        @keyup:esc="focusSearch"
                        @focus="onFocusMenuItem"
                        @click-done="forceHideMenu"
        >
            <template #item--format="{item}">
                <span class="p-filterable-dropdown__item-label">
                    <span v-for="(text, i) in item.label.split(state.searchRegex)"
                          :key="`item-label--${text}-${i}`"
                          :class="{ 'selected': state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default && item.name === state.selectedNames[0] }"
                    >
                        <span v-if="i !== 0"
                              class="font-bold"
                        >{{ getMatchText(item.label) }}</span><span>{{ text }}</span>
                    </span>
                </span>
            </template>
            <template v-for="(_, slot) of state.menuSlots"
                      #[slot]="scope"
            >
                <slot :name="`menu-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-context-menu>
    </div>
</template>

<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch, nextTick, toRef, useSlots, ref,
} from 'vue';

// CAUTION: this vOnClickOutside is using !! Please do not remove.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { vOnClickOutside } from '@vueuse/components';
import { reduce } from 'lodash';

import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type {
    FilterableDropdownMenuItem,
    AutocompleteHandler,
} from '@/inputs/dropdown/filterable-dropdown/type';
import {
    FILTERABLE_DROPDOWN_TYPE,
} from '@/inputs/dropdown/filterable-dropdown/type';
import PSearch from '@/inputs/search/search/PSearch.vue';

interface FilterableDropdownProps {
    /* search props */
    value?: string;
    placeholder?: string;
    isFocused?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    /* context menu props */
    menu?: MenuItem[];
    loading?: boolean;
    selected?: FilterableDropdownMenuItem[];
    multiSelectable?: boolean;
    visibleMenu?: boolean;
    useFixedMenuStyle?: boolean;
    /* extra props */
    type?: FILTERABLE_DROPDOWN_TYPE;
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    exactMode?: boolean;
    strictSelectMode?: boolean;
    disableDeleteAll?: boolean;
}
const props = withDefaults(defineProps<FilterableDropdownProps>(), {
    value: '',
    isFocused: false,
    invalid: false,
    disabled: false,
    readonly: false,
    menu: () => [],
    loading: false,
    selected: () => [],
    multiSelectable: false,
    visibleMenu: undefined,
    useFixedMenuStyle: false,
    disableHandler: false,
    exactMode: true,
    strictSelectMode: false,
    disableDeleteAll: false,
});
const emit = defineEmits<{(e: string, ...args: any[]): void; }>();
const slots = useSlots();

const menuRef = ref<any|null>(null);
const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean>('visibleMenu', props, emit),
    filterableDropdownType: computed<FILTERABLE_DROPDOWN_TYPE | undefined>(() => {
        if (props.type) return props.type;
        if (!props.multiSelectable) return FILTERABLE_DROPDOWN_TYPE.default;
        return undefined;
    }),
    proxyValue: useProxyValue('value', props, emit),
    proxyIsFocused: useProxyValue('isFocused', props, emit),
    proxySelected: useProxyValue('selected', props, emit),
    placeholderValue: undefined as string|undefined,
    filteredMenu: [] as FilterableDropdownMenuItem[],
    bindingMenu: computed<FilterableDropdownMenuItem[]>(() => (props.disableHandler ? props.menu : state.filteredMenu)),
    searchableItems: computed<FilterableDropdownMenuItem[]>(() => props.menu.filter((d) => d.type === undefined || d.type === 'item')),
    searchRegex: computed(() => new RegExp(state.proxyValue || '', 'i')),
    selectedNames: computed(() => state.proxySelected.map((item) => item.name)),
    //
    menuSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
        return res;
    }, {})),
    searchSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('search-')) res[`${name.substring(7)}`] = d;
        return res;
    }, {})),
});

const {
    targetRef, contextMenuStyle,
} = useContextMenuFixedStyle({
    useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
    visibleMenu: toRef(state, 'proxyVisibleMenu'),
});

const defaultHandler = (inputText: string, list: FilterableDropdownMenuItem[]) => {
    let results: FilterableDropdownMenuItem[] = [...list];
    const trimmed = inputText.trim();
    if (trimmed) {
        const regex = new RegExp(inputText, 'i');
        results = results.filter((d) => regex.test(d.label as string));
    }
    return { results };
};

const filterMenu = async (val: string) => {
    if (props.disableHandler) return;

    if (props.handler) {
        let res = props.handler(val, state.searchableItems);
        if (res instanceof Promise) res = await res;
        state.filteredMenu = res.results;
    } else {
        const results = defaultHandler(val, state.searchableItems).results;

        const filtered = props.menu.filter((item) => {
            if (item.type && item.type !== 'item') return true;
            return !!results.find((d) => d.label === item.label);
        });
        if (filtered[filtered.length - 1]?.type === 'divider') filtered.pop();
        state.filteredMenu = filtered;
    }
};

const getMatchText = (text: string): string => {
    const res = state.searchRegex.exec(text);
    if (res) return res[0];
    return '';
};


/* event util */
const focusSearch = () => {
    if (state.proxyIsFocused) return;
    state.proxyIsFocused = true;
};

const hideMenu = (mode?: string) => {
    if (!state.proxyVisibleMenu) return;
    // placeholder
    const isRadioItemSelected = state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.radioButton && (mode === 'click' || state.proxySelected.length);
    if (isRadioItemSelected) {
        state.placeholderValue = '';
    } else if (props.multiSelectable && state.proxySelected.length) {
        state.placeholderValue = ' ';
    } else {
        state.placeholderValue = props.placeholder;
    }

    // value
    const isDefaultItemSelected = state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default && mode !== 'click';
    if (isDefaultItemSelected) {
        const item = state.proxySelected[0];
        if (item) state.proxyValue = item.label ?? item.name ?? '';
        else state.proxyValue = '';
    }
    if (state.filterableDropdownType !== FILTERABLE_DROPDOWN_TYPE.default) {
        state.proxyValue = '';
    }

    state.proxyVisibleMenu = false;
    emit('hide-menu');
};

const showMenu = () => {
    if (state.proxyVisibleMenu) return;

    if (
        state.proxySelected.length && (
            state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default
                    || state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.radioButton
        )
    ) {
        // If there is an existing selected item, the value will be placeholder & filter will be initialized
        const selectedItem = state.proxySelected[0] as FilterableDropdownMenuItem;
        state.placeholderValue = selectedItem.label ?? selectedItem.name ?? '';
        state.proxyValue = '';
        filterMenu('');
    } else {
        filterMenu(state.proxyValue);
    }

    state.proxyVisibleMenu = true;
    emit('show-menu');
};

const focusMenu = () => {
    if (state.bindingMenu.length === 0) return;
    if (menuRef.value) menuRef.value.focus();
};

const allFocusOut = () => {
    if (!state.proxyIsFocused) return;
    state.proxyIsFocused = false;
    hideMenu();
};


/* event */
const onFocusMenuItem = (index: string) => {
    emit('focus-menu', index);
};

const onFocusSearchInput = () => {
    showMenu();
};

const onDeleteTag = (item: FilterableDropdownMenuItem, index: number) => {
    state.proxySelected.splice(index, 1);
    state.proxySelected = [...state.proxySelected];
    emit('delete-tag', item, index);
};

const onDeleteAllTags = () => {
    state.proxySelected = [];
    emit('delete-all-tags');
};

const onDeleteSearchText = (...args) => {
    if (state.proxyValue) {
        state.proxyValue = '';
    }

    if (state.proxySelected.length === 0) return;

    if (state.filterableDropdownType !== FILTERABLE_DROPDOWN_TYPE.default) return;

    const item = state.proxySelected[0];
    state.proxySelected.splice(0, 1);
    emit('delete-tag', item, 0);
    emit('delete', ...args);
    emit('search', '');
    focusSearch();
};

const onInput = (val: string, e) => {
    if (!state.proxyVisibleMenu) showMenu();

    state.proxyValue = val;

    emit('input', val, e);

    filterMenu(val);
};

const handleSelectMenuItem = (item: FilterableDropdownMenuItem) => {
    if ([FILTERABLE_DROPDOWN_TYPE.default, FILTERABLE_DROPDOWN_TYPE.radioButton].includes(state.filterableDropdownType)) {
        hideMenu('click');
    }
    if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default) {
        state.proxyValue = item.label ?? item.name ?? '';
    }
    if (props.multiSelectable) state.proxyIsFocused = true;

    emit('select-menu', item);
};

const onSearch = (val?: string) => {
    const trimmed = val?.trim() ?? '';
    const menuItem = state.filteredMenu.find((d) => trimmed.toLowerCase() === d.label?.toLowerCase());
    if (menuItem) {
        emit('select-menu', menuItem);
        state.proxyValue = menuItem.label ?? menuItem.name ?? '';
        if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default) {
            state.proxySelected = [menuItem];
        } else if (!state.selectedNames.includes(menuItem.name)) {
            state.proxySelected.push(menuItem);
        }
    } else if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default) {
        if (!state.proxySelected.length) state.proxyValue = '';
    }

    if (!menuItem && props.exactMode) {
        state.proxyValue = '';
        emit('search', '');
    } else {
        emit('search', trimmed);
    }

    nextTick(() => {
        allFocusOut();
    });
};


const handleClickDropdownButton = () => {
    if (props.disabled) return;
    if (state.proxyVisibleMenu) hideMenu();
    else showMenu();
};

const handleClick = (e) => {
    if (props.disabled) return;
    state.proxyIsFocused = true;
    showMenu();
    emit('click', e);
};

const handleSearchKeyup = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Down') focusMenu();
    else if (e.key === 'Escape' || e.key === 'Esc') allFocusOut();
    emit('keyup', e);
};
const handleSearchFocus = (e) => {
    onFocusSearchInput();
    emit('focus', e);
};

const onWindowKeydown = (e: KeyboardEvent) => {
    if (state.proxyVisibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
    }
};
const forceHideMenu = () => {
    hideMenu();
};

onMounted(() => {
    window.addEventListener('keydown', onWindowKeydown, false);
});
onUnmounted(() => {
    window.removeEventListener('keydown', onWindowKeydown, false);
});

watch(() => props.menu, (menu) => {
    state.filteredMenu = menu;
    filterMenu(state.proxyValue);
});

watch(() => state.proxySelected, (proxySelected) => {
    if (!proxySelected.length) {
        state.placeholderValue = props.placeholder;
        if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default) state.proxyValue = '';
        return;
    }

    if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.default) {
        const item = state.proxySelected[0];
        if (item) state.proxyValue = item.label ?? item.name ?? '';
        else state.proxyValue = '';
    } else if (state.filterableDropdownType === FILTERABLE_DROPDOWN_TYPE.radioButton && state.placeholderValue !== '') {
        state.placeholderValue = '';
    }
}, { immediate: true });

watch(() => props.disabled, (disabled) => {
    if (disabled === true) forceHideMenu();
});

</script>

<style lang="postcss">
.p-filterable-dropdown {
    @apply w-full relative;
    .p-search {
        .input-container {
            @apply text-sm font-normal;
            &.disabled {
                @apply text-gray-300;
                .dropdown-button {
                    cursor: default;
                }
            }
            &.focused:not(.disabled) {
                .dropdown-button {
                    @apply text-secondary;
                }
            }
        }
    }
    .selected-radio-label {
        @apply w-full flex justify-between items-center;
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
        line-height: 1.125rem;
    }
    .delete-icon {
        @apply min-w-4;
    }
    .dropdown-button {
        cursor: pointer;
        flex-shrink: 0;
    }
    .p-context-menu {
        @apply font-normal;
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: 100%;

        &.default {
            .context-item {
                &.selected {
                    @apply bg-blue-200;
                }
                &:not(.disabled):not(.empty) {
                    &:hover, &:focus {
                        @apply bg-blue-100;
                    }
                }
            }
        }

        .p-filterable-dropdown__item-label {
            flex-grow: 1;
        }
    }

    &.multi-selectable {
        .p-search {
            .input-container {
                @apply relative flex-wrap row-gap-1;
                padding-right: 3rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;

                .dropdown-button {
                    @apply absolute;
                    top: 0.1875rem;
                    right: 0.5rem;
                }
                > .delete-icon {
                    @apply absolute cursor-pointer;
                    right: 2rem;
                    top: 0.4375rem;
                    height: 100%;
                }
            }
        }
    }
}
</style>