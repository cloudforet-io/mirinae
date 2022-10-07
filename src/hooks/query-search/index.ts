import type { SetupContext, WatchStopHandle } from 'vue';
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';

import { cloneDeep, debounce, throttle } from 'lodash';

import {
    defaultHandlerMap, formatterMap,
    inputTypeMap, inputValidatorMap,
    menuTypeMap,
    placeholderMap,
    supportOperatorMap,
} from '@/inputs/search/query-search/config';
import {
    findKey, getKeyMenuForm, getRootKeyItemHandler, getValueMenuForm,
} from '@/inputs/search/query-search/helper';
import type {
    KeyItem, OperatorType, KeyDataType, QuerySearchProps,
    HandlerResponse, MenuType, ValueHandler,
    KeyMenuItem, ValueMenuItem,
    QueryItem, ValueItem,
} from '@/inputs/search/query-search/type';
import { OPERATOR, operators } from '@/inputs/search/query-search/type';

const ROOT_KEY_SETTER = ':';
const NUMBER_TYPES = ['integer', 'float'];

export const useQuerySearch = (props: QuerySearchProps, { emit }: SetupContext) => {
    const state = reactive({
        /* Input */
        inputRef: null as null|HTMLElement,
        isFocused: props.focused,
        searchText: props.value,
        currentPlaceholder: computed(() => placeholderMap[state.currentDataType] || undefined),
        inputElType: computed(() => inputTypeMap[state.currentDataType] || 'text'),
        currentDataType: computed<KeyDataType|string>(() => {
            if (state.selectedKeys.length > 1) return state.handlerResp.dataType || '';
            if (state.rootKey) return state.rootKey.dataType || '';
            return '';
        }),

        /* Query */
        selectedKeys: [] as KeyItem[],
        subPath: computed<string|undefined>(() => state.selectedKeys.slice(1).map(d => d.name).join('.') || undefined),
        selectedKey: computed<KeyItem|null>(() => state.selectedKeys[state.selectedKeys.length - 1] || null),
        rootKey: computed<KeyItem|null>(() => state.selectedKeys[0] || null),
        operator: OPERATOR.contain as OperatorType,
        supportOperators: computed<OperatorType[]>(() => {
            if (state.handlerResp.operators) return state.handlerResp.operators;
            if (state.rootKey?.operators) return state.rootKey.operators;
            if (supportOperatorMap[state.currentDataType]) return supportOperatorMap[state.currentDataType];
            return operators;
        }),

        /* Menu */
        menuRef: null as any,
        visibleMenu: false,
        menuType: computed<MenuType>(() => {
            if (!state.rootKey) return 'ROOT_KEY';
            if (state.currentDataType === 'object') return 'KEY';
            return menuTypeMap[state.currentDataType] || 'VALUE';
        }),
        menu: [] as Array<KeyMenuItem|ValueMenuItem>,

        /* Handler */
        loading: false,
        lazyLoading: false,
        handler: computed<ValueHandler|null>(() => {
            if (state.menuType === 'ROOT_KEY') return getRootKeyItemHandler(props.keyItemSets);
            return defaultHandlerMap[state.currentDataType]
                || props.valueHandlerMap[state.rootKey?.name as string]
                || null;
        }),
        handlerResp: { results: [] } as HandlerResponse,
    });

    /* Control Input */
    const focus = () => { state.isFocused = true; };
    const blur = () => { state.isFocused = false; };

    /* Control Menu */
    const hideMenu = () => { state.visibleMenu = false; };
    const showMenu = async (refresh = false) => {
        state.visibleMenu = true;
        // eslint-disable-next-line no-use-before-define
        if (refresh) await updateMenuItems(state.searchText);
    };
    let offMenuFocusWatch: WatchStopHandle|undefined;
    const focusMenu = async (idx = 0) => {
        if (!state.visibleMenu) await showMenu(true);
        if (state.menuRef) state.menuRef.focus(idx);
        else {
            if (offMenuFocusWatch) offMenuFocusWatch();
            offMenuFocusWatch = watch(() => state.menuRef, (menuRef) => {
                if (menuRef) {
                    menuRef.focus(idx);
                    if (offMenuFocusWatch) offMenuFocusWatch();
                }
            });
        }
    };

    /* Control Input */
    const leaveSearch = () => {
        blur();
        hideMenu();
    };
    const clearAll = () => {
        state.searchText = '';
        state.operator = OPERATOR.contain;
    };
    const updateOperator = (operator?: OperatorType) => {
        if (operator === undefined) {
            if (state.operator.length === 2) state.operator = state.operator.substring(0, 1) as OperatorType;
            else state.operator = OPERATOR.contain;
        } else {
            state.operator = operator;
        }
    };
    const findAndSetKey = async (val: string, isRootKey = true) => {
        let item = findKey(val, state.handlerResp.results) || null;
        if (isRootKey) {
            if (item) {
                clearAll();
                focus();
                updateSelectedKey(item, true);
                await updateMenuItems(state.searchText);
            }
        } else {
            if (!item) item = { label: val, name: val };
            clearAll();
            focus();
            updateSelectedKey(item);
            await updateMenuItems(state.searchText);
        }
    };

    /* Control Menu Loading */
    const updateLoader = debounce(() => {
        state.lazyLoading = state.loading;
    }, 500);
    const updateLoading = (value, force = false) => {
        state.loading = value;
        if (force) state.lazyLoading = value;
        else if (state.lazyLoading !== state.loading) updateLoader();
    };

    /* Menu Setting */
    const updateSelectedKey = (item: KeyItem|null, replace = false) => {
        if (replace) {
            if (item) state.selectedKeys = [item];
            else state.selectedKeys = [];
        } else if (item) state.selectedKeys.push(item);
        else state.selectedKeys.pop();
    };
    const setMenu = (res: HandlerResponse) => {
        if (state.menuType === 'ROOT_KEY') state.menu = res.results;
        else if (state.menuType === 'KEY') state.menu = getKeyMenuForm(res, state.selectedKeys, state.subPath);
        else if (state.menuType === 'VALUE') state.menu = getValueMenuForm(res, state.selectedKeys, state.operator, state.subPath);
        else state.menu = res.results.map(d => ({ ...d, type: 'item', data: d }));
        if (!state.menu.length) hideMenu();
    };
    const updateMenuItems = throttle(async (inputText: string): Promise<void> => {
        let res: HandlerResponse = { results: [] };
        updateLoading(true);

        const input = NUMBER_TYPES.includes(state.currentDataType) ? Number(inputText) : inputText;
        if (state.handler) {
            const func = state.handler(input,
                state.rootKey as KeyItem,
                state.currentDataType,
                state.subPath,
                state.operator);
            if (func instanceof Promise) {
                res = await func;
            } else {
                res = func;
            }
        }

        state.handlerResp = res;
        setMenu(res);
        updateLoading(false, true);
    }, 150);

    /* Utils */
    const getKeyItemsFromKeyText = (keyStr: string): KeyItem[] => {
        const allKeyItems = props.keyItemSets.map(d => d.items).flat();
        const dotIdx = keyStr.indexOf('.');
        let keyItems: KeyItem[] = [];

        if (dotIdx === -1) {
            const item = findKey(keyStr, allKeyItems);
            if (item) keyItems.push(item);
        } else {
            const item = findKey(keyStr.slice(0, dotIdx), allKeyItems);
            if (item?.dataType === 'object') {
                keyItems = keyStr.split('.').map((d, i) => (i === 0 ? item : { label: d, name: d }));
            } else if (item) keyItems.push(item);
        }

        return keyItems;
    };
    const onDelete = async (e) => {
        if (e.target.value) return;

        if (state.operator) {
            updateOperator();
            await updateMenuItems(state.searchText);
        } else if (state.selectedKey) {
            updateSelectedKey(null);
            await updateMenuItems('');
        }
    };

    /* Event triggers */
    const emitSearch = (valueItem: ValueItem, fixedOperator?: OperatorType) => {
        let queryItem: QueryItem|null = {
            key: state.rootKey,
            value: valueItem,
            operator: fixedOperator ?? state.operator,
        };

        if (formatterMap[state.rootKey?.dataType]) {
            queryItem = formatterMap[state.rootKey.dataType](cloneDeep(queryItem), state.currentDataType, state.subPath);
        }

        if (queryItem) {
            emit('search', queryItem);

            clearAll();
            if (state.selectedKey) updateSelectedKey(null, true);
            hideMenu();
        }
    };


    /* Event handlers */
    const onInput = async (e) => {
        const val = e.target.value === null || e.target.value === undefined ? '' : e.target.value;
        state.searchText = val;

        if (!state.visibleMenu) await showMenu();

        if (val.length > 1 && e.data === ROOT_KEY_SETTER && !state.rootKey) await findAndSetKey(val.slice(0, val.length - 1));
        else await updateMenuItems(val);
    };
    const onEnter = async () => {
        if (state.currentDataType === 'object') {
            if (state.searchText) await findAndSetKey(state.searchText, false);
        } else if (state.rootKey) {
            // In null case, only '=', '!=' operators are available.
            if (state.searchText === '') emitSearch({ label: 'Null', name: null }, state.operator.startsWith('!') ? '!=' : '=');
            else emitSearch({ label: state.searchText, name: state.searchText });
        } else if (state.searchText) emitSearch({ label: state.searchText, name: state.searchText });
    };

    const onKeydownCheck = async (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            await onDelete(e);
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'Down') {
            await focusMenu();
            return;
        }
        if (e.key === 'ArrowUp' || e.key === 'Up') {
            await focusMenu(-1);
            return;
        }
        if (e.key === 'Escape' || e.key === 'Esc') {
            leaveSearch();
            return;
        }

        if (!state.selectedKey) return;

        /* check operator */
        if (state.searchText.length === 0) {
            const op = state.operator + e.key;
            if (state.supportOperators.some(d => d.startsWith(op))) {
                e.preventDefault();
                updateOperator(op as OperatorType);
                await updateMenuItems(state.searchText);
            } else if (!state.supportOperators.includes(state.operator)) {
                updateOperator('');
                if (state.operator !== '') await updateMenuItems(state.searchText);
            }
        }

        /* value validation */
        if (inputValidatorMap[state.currentDataType]) {
            const validator = inputValidatorMap[state.currentDataType];
            if (!validator(e.key)) e.preventDefault();
        }
    };
    const onPaste = (e: ClipboardEvent) => {
        if (state.selectedKeys.length > 0) return;

        const paste: string = (e.clipboardData || (window as any).clipboardData).getData('text');
        const text = (state.searchText + paste).trim().replace(/(\r\n|\n|\r)/gm, '');

        const separatorIdx = text.indexOf(':');
        if (separatorIdx === -1) {
            state.searchText = text;
        } else {
            const keyStr = text.slice(0, separatorIdx);
            const keyItems = getKeyItemsFromKeyText(keyStr);

            const value = text.slice(separatorIdx + 1);
            if (keyItems.length > 0) {
                state.selectedKeys = keyItems;
                state.searchText = value;
                hideMenu();
            } else {
                state.searchText = text;
            }
        }

        e.preventDefault();
    };
    const onDeleteAll = () => {
        updateSelectedKey(null, true);
        clearAll();
        focus();
    };
    const onMenuSelect = async (item: KeyMenuItem|ValueMenuItem) => {
        if (state.menuType === 'ROOT_KEY' || state.menuType === 'KEY') {
            hideMenu();
            updateSelectedKey(item.data as KeyItem);
            clearAll();
            focus();
            await showMenu(true);
        } else if (state.menuType === 'OPERATOR') {
            const operator = item.name as OperatorType;
            if (state.supportOperators.includes(operator)) {
                updateOperator(operator);
                focus();
                hideMenu();
            }
        } else {
            if (!state.operator) state.operator = OPERATOR.equal;
            emitSearch(item.data as ValueItem);
        }
    };


    /* Window Events Binding */
    const onWindowKeydown = (e: KeyboardEvent) => {
        if (state.visibleMenu && ['ArrowDown', 'ArrowUp'].includes(e.code)) {
            e.preventDefault();
        }
    };
    onMounted(() => {
        window.addEventListener('click', hideMenu);
        window.addEventListener('blur', hideMenu);
        window.addEventListener('keydown', onWindowKeydown, false);
    });
    onUnmounted(() => {
        window.removeEventListener('click', hideMenu);
        window.removeEventListener('blur', hideMenu);
        window.removeEventListener('keydown', onWindowKeydown, false);
    });


    return {
        state,
        // UI controllers
        focus,
        blur,
        hideMenu,
        showMenu,
        // event emitters
        emitSearch,
        // event handlers
        onInput,
        onEnter,
        onKeydownCheck,
        onPaste,
        onDeleteAll,
        onMenuSelect,
    };
};
