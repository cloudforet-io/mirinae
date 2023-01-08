import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { isEqual } from 'lodash';

import type { MenuItem } from '@/inputs/context-menu/type';

type ReorderMode = 'normal'|'strict'|'attach';
interface UseContextMenuReorderOptions {
    reorderMode?: Ref<ReorderMode>;
    selected: Ref<MenuItem[]>;
    originMenu: Ref<MenuItem[]>;
}

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

export const useContextMenuReorder = ({
    selected, originMenu,
}: UseContextMenuReorderOptions) => {
    const reorderedMenu = ref<MenuItem[]>([]);
    const reorderMenuItems = () => {
        // TODO: Separation of logic according to reorderMode
        reorderedMenu.value = reorderMenuBySelection(selected.value, originMenu.value, reorderedMenu.value);
    };
    return {
        reorderedMenu: computed<MenuItem[]>(() => reorderedMenu.value),
        reorderMenuItems,
    };
};
