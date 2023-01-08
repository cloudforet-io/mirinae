import type { ComputedRef, Ref } from 'vue';
import type Vue from 'vue';
import { computed, reactive, toRef } from 'vue';

import { useContextMenuReorder } from '@/hooks/context-menu-controller/context-menu-reorder';
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

    /* Whether to automatically reorder on showContextMenu(). */
    useReorderBySelection?: boolean;
    /* Required values when using the reorder by selection feature: originMenu, selected */
    originMenu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // The original menu that serves as the basis for order when reordering menus
    selected?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // Items to be displayed at the top of the menu
}

export interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    hideContextMenu: { (): void };
    showContextMenu: { (): void };
    focusOnContextMenu: FocusOnContextMenu;
    fixedMenuStyle?: Ref<Partial<CSSStyleDeclaration>>;
    refinedMenu: ComputedRef<MenuItem[]>; // Reordered menu based on selection when using the reorder by selection feature
}

interface FocusOnContextMenu { (position?: number): void }

export const useContextMenuController = ({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, useReorderBySelection, originMenu, selected,
}: UseContextMenuControllerOptions): UseContextMenuControllerReturns => {
    if (!targetRef) throw new Error('\'targetRef\' option must be given.');
    if (!contextMenuRef) throw new Error('\'contextMenuRef\' option must be given.');

    const state = reactive({
        targetRef,
        contextMenuRef,
        visibleMenu: visibleMenu ?? false,
        originMenu: originMenu ?? [] as MenuItem[],
        selected: selected ?? [] as MenuItem[],
    });

    const {
        contextMenuStyle: fixedMenuStyle,
    } = useContextMenuFixedStyle({
        useFixedMenuStyle: useFixedStyle,
        visibleMenu: toRef(state, 'visibleMenu'),
        targetRef,
    });

    let reorder: ReturnType<typeof useContextMenuReorder>|undefined;
    if (useReorderBySelection) {
        if (!originMenu || !selected) {
            throw new Error('If \'useReorderBySelection\' is \'true\', \'originMenu\' and \'selected\' option must be given.');
        }

        reorder = useContextMenuReorder({
            selected: toRef(state, 'selected'),
            originMenu: toRef(state, 'originMenu'),
        });
    }


    const showContextMenu = () => {
        if (!state.visibleMenu) {
            if (reorder) reorder.reorderMenuItems();
            state.visibleMenu = true;
        }
    };
    const hideContextMenu = () => {
        if (state.visibleMenu) state.visibleMenu = false;
    };

    const focusOnContextMenu: FocusOnContextMenu = async (position?: number) => {
        if (state.contextMenuRef) {
            state.contextMenuRef.focus(position);
        }
    };

    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        refinedMenu: computed(() => (reorder ? reorder.reorderedMenu.value : state.originMenu)),
        showContextMenu,
        hideContextMenu,
        focusOnContextMenu,
        fixedMenuStyle,
    };
};
