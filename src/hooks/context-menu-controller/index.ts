import type { ComputedRef, Ref } from 'vue';
import type Vue from 'vue';
import { reactive, toRef } from 'vue';

import { useContextMenuFixedStyle } from '@/hooks';
import type { MenuItem } from '@/inputs/context-menu/type';

export interface UseContextMenuControllerOptions {
    useFixedStyle?: boolean;
    visibleMenu?: Ref<boolean>|boolean;
    targetRef: Ref<HTMLElement|Vue|null>;
    contextMenuRef: Ref<Vue|null>;
    menu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>;
    useReorderBySelection?: boolean;
}

export interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    hideContextMenu: { (): void };
    showContextMenu: { (): void };
    focusOnContextMenu: FocusOnContextMenu;
    focusOutFromContextMenu: FocusOutFromContextMenu;
    reorderMenuBySelection: ReorderMenuBySelection;
    fixedMenuStyle?: Ref<Partial<CSSStyleDeclaration>>;
}

interface FocusOnContextMenu { (position?: number): void }
interface FocusOutFromContextMenu { (): void }
interface ReorderMenuBySelection { (selected: MenuItem[]): MenuItem[] }

export const useContextMenuController = ({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, menu, useReorderBySelection,
}: UseContextMenuControllerOptions): UseContextMenuControllerReturns => {
    if (!targetRef) throw new Error('No targetRef received.');
    if (!contextMenuRef) throw new Error('No contextMenuRef received.');
    if (useReorderBySelection && !menu) throw new Error('No menu received to reorder by selection.');

    const state = reactive({
        targetRef,
        contextMenuRef,
        visibleMenu: visibleMenu ?? false,
    });

    let fixedMenuStyle: Ref<Partial<CSSStyleDeclaration>>|undefined;
    if (useFixedStyle) {
        const {
            contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: true,
            visibleMenu: toRef(state, 'visibleMenu'),
            targetRef,
        });
        fixedMenuStyle = contextMenuStyle;
    }

    const showContextMenu = () => {
        state.visibleMenu = true;
    };
    const hideContextMenu = () => {
        state.visibleMenu = false;
    };

    // TODO
    const focusOnContextMenu: FocusOnContextMenu = () => {
    };

    // TODO
    const focusOutFromContextMenu: FocusOutFromContextMenu = () => {
    };

    // TODO
    const reorderMenuBySelection: ReorderMenuBySelection = (selected: MenuItem[]) => selected;


    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        showContextMenu,
        hideContextMenu,
        focusOnContextMenu,
        focusOutFromContextMenu,
        reorderMenuBySelection,
        fixedMenuStyle,
    };
};