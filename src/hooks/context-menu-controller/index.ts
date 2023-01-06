import type { ComputedRef, Ref } from 'vue';
import type Vue from 'vue';
import {
    computed,
    isRef, reactive, toRef, watch,
} from 'vue';

import { isEqual } from 'lodash';

import type { ContextMenuHandler } from '@/hooks/context-menu-filtering';
import { useContextMenuFiltering } from '@/hooks/context-menu-filtering';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import type { MenuItem } from '@/inputs/context-menu/type';


export interface UseContextMenuControllerOptions {
    visibleMenu?: Ref<boolean>|boolean;
    targetRef: Ref<HTMLElement|Vue|null>;
    contextMenuRef: Ref<any|null>;

    /*
    Useful when used inside an element whose css position attribute value is fixed.
    It automatically resizes and provides a function that automatically closes when scrolling.
    fixedMenuStyle is returned only when this value is true.
     */
    useFixedStyle?: boolean|Ref<boolean>|undefined|ComputedRef<boolean|undefined>;

    /*
   Whether to make update refinedMenu by executing reorderMenuBySelection().
   If this options is true, reorderMenuBySelection() will use selected and originMenu options as their arguments.
   Also, reorderMenuBySelection() will be executed automatically when hideContextMenu(true) or showContextMenu(true) have been called.
    */
    useReorderBySelection?: boolean;
    /* Required values when using the reorder by selection feature: originMenu, selected */
    originMenu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // The original menu that serves as the basis for order when reordering menus
    selected?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // Items to be displayed at the top of the menu

    /* Whether to use filtering feature */
    filterable?: boolean;
    /* Options for filtering feature: searchText, disableHandler, handler, pageSize, originMenu */
    searchText?: Ref<string>;
    disableHandler?: Ref<boolean|undefined>|boolean|undefined;
    handler?: Ref<ContextMenuHandler|undefined>|ContextMenuHandler|undefined;
    pageSize?: Ref<number|undefined>|number|undefined;
}

export interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    hideContextMenu: { (reorderMenu?: boolean): void };
    showContextMenu: { (reorderMenu?: boolean): void };
    focusOnContextMenu: FocusOnContextMenu;
    fixedMenuStyle?: Ref<Partial<CSSStyleDeclaration>>;
    /*
    If useReorderBySelection is true, reordering will be applied automatically on showContextMenu().
    If filterable is true, filtering will be applied automatically on showContextMenu().
    If both are true, filtering and reordering will be applied automatically on showContextMenu().
    */
    refinedMenu: ComputedRef<MenuItem[]>;
    handlerLoading?: Ref<boolean>; // available in filterable case
    attachMoreItems: {(): Promise<void>|void}; // available in filterable case
}

interface FocusOnContextMenu { (position?: number): void }

type MenuFilteringResult = ReturnType<typeof useContextMenuFiltering>;

const reorderMenuBySelection = (selected: MenuItem[], origin: MenuItem[], before: MenuItem[]): MenuItem[] => {
    const selectedMap = {};
    selected.forEach((item) => {
        if (!item.name) return;
        selectedMap[item.name] = item;
    });

    const unselected = origin.filter((item) => {
        if (!item.name) return true;
        if (item.type === 'divider' && item.name === 'selection-divider') return false;
        return !selectedMap[item.name];
    });

    let newItems: MenuItem[] = [];
    if (selected.length) {
        newItems = newItems.concat(selected);
        newItems.push({ type: 'divider', name: 'selection-divider' });
        newItems = newItems.concat(unselected);
    } else {
        newItems = unselected;
    }

    if (isEqual(before, newItems)) return before;

    return newItems;
};

export const useContextMenuController = ({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, useReorderBySelection, originMenu, selected,
    filterable, searchText, disableHandler, handler, pageSize,
}: UseContextMenuControllerOptions): UseContextMenuControllerReturns => {
    if (!targetRef) throw new Error('\'targetRef\' option must be given.');
    if (!contextMenuRef) throw new Error('\'contextMenuRef\' option must be given.');

    if (useReorderBySelection && (!originMenu || !selected)) {
        throw new Error('If \'useReorderBySelection\' is \'true\', \'originMenu\' and \'selected\' option must be given.');
    }

    const state = reactive({
        targetRef,
        contextMenuRef,
        visibleMenu: visibleMenu ?? false,
        originMenu: originMenu ?? [] as MenuItem[],
        selected: selected ?? [] as MenuItem[],
        refinedMenu: [] as MenuItem[],
    });

    // use fixed menu style
    const {
        contextMenuStyle: fixedMenuStyle,
    } = useContextMenuFixedStyle({
        useFixedMenuStyle: useFixedStyle,
        visibleMenu: toRef(state, 'visibleMenu'),
        targetRef,
    });

    // filtering menu
    let menuFiltering: MenuFilteringResult|undefined;
    if (filterable) {
        if (!searchText) throw new Error('If \'filterable\' is \'true\', \'searchText\' option must be given.');
        if (!isRef(searchText)) throw new Error('\'searchText\' option must be ref.');
        if (!handler) {
            if (!disableHandler || (isRef(disableHandler) && !disableHandler.value)) {
                if (!originMenu) {
                    throw new Error('Give \'disableHandler\' is \'true\' or give \'handler\' or give \'originMenu\' for menu filtering.');
                }
            }
        }
        menuFiltering = useContextMenuFiltering({
            searchText,
            disableHandler,
            handler,
            pageSize,
            menu: toRef(state, 'originMenu'),
        });
        watch(searchText, async () => {
            if (state.visibleMenu) {
                state.refinedMenu = await (menuFiltering as MenuFilteringResult).filterMenu();
            }
        });
    }

    // control menu visibility
    const showContextMenu = async () => {
        if (!state.visibleMenu) {
            if (filterable && menuFiltering) {
                menuFiltering.resetMenu();
                state.refinedMenu = await menuFiltering.filterMenu();
            }
            if (useReorderBySelection) {
                if (filterable) {
                    state.refinedMenu = reorderMenuBySelection(state.selected, state.refinedMenu, state.refinedMenu);
                } else {
                    state.refinedMenu = reorderMenuBySelection(state.selected, state.originMenu, state.refinedMenu);
                }
            }
            state.visibleMenu = true;
        }
    };
    const hideContextMenu = () => {
        if (state.visibleMenu) {
            state.visibleMenu = false;
            if (filterable && searchText) searchText.value = '';
        }
    };

    // focus control
    const focusOnContextMenu: FocusOnContextMenu = async (position?: number) => {
        if (state.contextMenuRef) {
            state.contextMenuRef.focus(position);
        }
    };

    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        refinedMenu: computed(() => state.refinedMenu),
        showContextMenu,
        hideContextMenu,
        focusOnContextMenu,
        fixedMenuStyle,
        // menu filtering
        handlerLoading: menuFiltering ? menuFiltering.handlerLoading : undefined,
        attachMoreItems: menuFiltering ? menuFiltering.attachMoreItems : () => {},
    };
};
