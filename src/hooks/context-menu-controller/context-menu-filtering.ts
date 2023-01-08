import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { MenuAttachHandler } from '@/hooks/context-menu-controller/context-menu-attach';
import { useContextMenuAttach } from '@/hooks/context-menu-controller/context-menu-attach';
import type { MenuItem } from '@/inputs/context-menu/type';

interface UseContextMenuFilteringOptions {
    searchText: Ref<string>;
    menu?: Ref<MenuItem[]>;
    handler?: Ref<MenuAttachHandler|undefined>;
    pageSize?: Ref<number|undefined>
}
export const useContextMenuFiltering = ({
    searchText, handler, menu, pageSize,
}: UseContextMenuFilteringOptions) => {
    // default handler case only
    const filteredItems = ref<MenuItem[]>([]);
    const filterMenuBySearchText = () => {
        if (!menu) return;

        let results: MenuItem[];
        const trimmed = searchText.value.trim();
        if (trimmed) {
            const regex = new RegExp(trimmed, 'i');
            results = menu.value.filter((d) => {
                if (d.type === undefined || d.type === 'item') return regex.test(d.label as string);
                return true;
            });
        } else {
            results = menu.value ?? [];
        }

        filteredItems.value = results;
    };
    const defaultAttachHandler: MenuAttachHandler = (inputText, pageStart, pageLimit) => {
        if (pageStart <= 1) {
            filterMenuBySearchText(); // reset filteredItems by searchText when the pagination value is the initial value
        }
        if (!pageSize?.value) { // do not need to slice filteredItems
            return {
                results: filteredItems.value,
                more: false,
            };
        }
        const sliced: MenuItem[] = filteredItems.value.slice(pageStart, pageLimit);
        return {
            results: sliced,
            more: filteredItems.value.length > pageLimit,
        };
    };

    const {
        attachedMenu,
        attachLoading,
        clearMenu,
        resetPagination,
        attachMenuItems,
    } = useContextMenuAttach({
        attachHandler: computed<MenuAttachHandler>(() => {
            if (handler?.value) return handler.value;
            return defaultAttachHandler;
        }),
        searchText,
        pageSize,
    });


    return {
        handlerLoading: attachLoading,
        displayMenuItems: attachedMenu,
        clearMenu,
        resetPagination,
        attachMenuItems,
    };
};
