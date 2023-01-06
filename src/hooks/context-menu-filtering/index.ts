import type { Ref } from 'vue';
import { computed, reactive, ref } from 'vue';

import type { MenuItem } from '@/inputs/context-menu/type';


export interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface ContextMenuHandler {
    (inputText: string, pageStart?: number, pageLimit?: number): Promise<HandlerRes>|HandlerRes;
}

interface UseFilterableDropdownMenuFilteringOptions {
    menu: Ref<MenuItem[]>|[];
    searchText: Ref<string>;
    disableHandler?: Ref<boolean|undefined>|boolean|undefined;
    handler?: Ref<ContextMenuHandler|undefined>|ContextMenuHandler|undefined;
    pageSize?: Ref<number|undefined>|number|undefined;
}

export const useContextMenuFiltering = ({
    searchText, disableHandler, handler, menu, pageSize,
}: UseFilterableDropdownMenuFilteringOptions) => {
    const state = reactive({
        menu,
        disableHandler,
        handler,
        pageSize,
    });

    const handlerLoading = ref<boolean>(false);

    // default handler case only
    const filteredItemsByDefaultHandler = ref<MenuItem[]>([]);
    const menuItemsByDefaultHandler = computed<MenuItem[]>(() => {
        if (!state.pageSize) return filteredItemsByDefaultHandler.value;

        if (filteredItemsByDefaultHandler.value.length > pageLimit.value) {
            const sliced = filteredItemsByDefaultHandler.value.slice(0, pageLimit.value);
            return [
                ...sliced,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as MenuItem[];
        }
        return filteredItemsByDefaultHandler.value;
    });

    // custom handler case only
    const accumulatedItemsByCustomHandler = ref<MenuItem[]>([]);
    const hasNextItemsByCustomHandler = ref<boolean>(false);
    const menuItemsByCustomHandler = computed<MenuItem[]>(() => {
        if (hasNextItemsByCustomHandler.value) {
            return [
                ...accumulatedItemsByCustomHandler.value,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as MenuItem[];
        }
        return accumulatedItemsByCustomHandler.value;
    });

    // pagination
    const pageNumber = ref<number>(0);
    const pageStart = computed(() => (pageNumber.value) * (state.pageSize ?? 0) + 1);
    const pageLimit = computed(() => (pageNumber.value + 1) * (state.pageSize ?? 0));

    // actual display menu items
    const filteredMenu = computed<MenuItem[]>(() => {
        if (state.disableHandler) return state.menu;
        // custom handler case
        if (state.handler) {
            return menuItemsByCustomHandler.value;
        }
        // default handler case
        return menuItemsByDefaultHandler.value;
    });

    const resetMenu = () => {
        if (state.disableHandler) return;
        if (state.handler) {
            accumulatedItemsByCustomHandler.value = [];
            hasNextItemsByCustomHandler.value = false;
        } else filteredItemsByDefaultHandler.value = [];
    };
    const resetPagination = () => {
        pageNumber.value = 0;
    };

    const defaultHandler = () => {
        let results: MenuItem[];
        const trimmed = searchText.value.trim();
        if (trimmed) {
            const regex = new RegExp(trimmed, 'i');
            results = state.menu.filter((d) => {
                if (d.type === undefined || d.type === 'item') return regex.test(d.label as string);
                return true;
            });
        } else {
            results = state.menu;
        }
        filteredItemsByDefaultHandler.value = results;
    };
    const customHandler = async (val: string, start: number, limit: number): Promise<{ results: MenuItem[], more: boolean }> => {
        if (!state.handler) return { results: [], more: false };
        let res = state.handler(val, start, limit);
        if (res instanceof Promise) res = await res;
        return { results: res.results, more: !!res.more };
    };

    const filterMenu = async (): Promise<MenuItem[]> => {
        if (state.disableHandler) return state.menu;
        handlerLoading.value = true;
        resetPagination();
        if (state.handler) {
            const { results, more } = await customHandler(searchText.value, pageStart.value, pageLimit.value);
            hasNextItemsByCustomHandler.value = more;
            accumulatedItemsByCustomHandler.value = results;
        } else {
            defaultHandler();
        }
        handlerLoading.value = false;
        return filteredMenu.value;
    };

    const attachMoreItems = async () => {
        pageNumber.value += 1;
        if (!state.disableHandler && state.handler) {
            handlerLoading.value = true;
            const { results, more } = await customHandler(searchText.value, pageStart.value, pageLimit.value);
            hasNextItemsByCustomHandler.value = more;
            accumulatedItemsByCustomHandler.value = accumulatedItemsByCustomHandler.value.concat(results);
            handlerLoading.value = false;
        }
    };

    return {
        handlerLoading,
        filteredMenu,
        resetMenu,
        filterMenu,
        attachMoreItems,
    };
};
