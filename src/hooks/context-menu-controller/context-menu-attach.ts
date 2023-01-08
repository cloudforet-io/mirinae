import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import type { MenuItem } from '@/inputs/context-menu/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
    more?: boolean;
}
export interface MenuAttachHandler {
    (inputText: string, pageStart: number, pageLimit: number): Promise<HandlerRes>|HandlerRes;
}

interface UseContextMenuAttachOptions {
    attachHandler: Ref<MenuAttachHandler>; // custom handler
    searchText?: Ref<string>;
    pageSize?: Ref<number|undefined>;
}

export const useContextMenuAttach = ({
    attachHandler, searchText, pageSize,
}: UseContextMenuAttachOptions) => {
    const accumulatedItemsByAttachHandler = ref<MenuItem[]>([]);
    const hasNextItemsByAttachHandler = ref<boolean>(false);
    const attachedMenu = computed<MenuItem[]>(() => {
        if (hasNextItemsByAttachHandler.value) {
            return [
                ...accumulatedItemsByAttachHandler.value,
                { type: 'showMore', name: 'filterableDropdownShowMore' },
            ] as MenuItem[];
        }
        return accumulatedItemsByAttachHandler.value;
    });

    // pagination
    const pageNumber = ref<number>(0);
    const pageStart = computed(() => (pageNumber.value) * (pageSize?.value ?? 0) + 1);
    const pageLimit = computed(() => (pageNumber.value + 1) * (pageSize?.value ?? 0));

    const clearMenu = () => {
        accumulatedItemsByAttachHandler.value = [];
        hasNextItemsByAttachHandler.value = false;
    };

    const resetPagination = () => {
        pageNumber.value = 0;
    };

    const attachLoading = ref(false);
    const attachMenuItems = async () => {
        attachLoading.value = true;
        const { results, more } = await attachHandler.value(searchText?.value ?? '', pageStart.value, pageLimit.value);
        hasNextItemsByAttachHandler.value = !!more;

        if (pageNumber.value === 0) {
            accumulatedItemsByAttachHandler.value = results;
        } else {
            accumulatedItemsByAttachHandler.value = accumulatedItemsByAttachHandler.value.concat(results);
        }
        attachLoading.value = false;
        pageNumber.value += 1; // increase page number for next handler's arguments - page start, page limit
    };

    return {
        attachedMenu,
        attachLoading: computed(() => attachLoading.value),
        clearMenu,
        resetPagination,
        attachMenuItems,
    };
};
