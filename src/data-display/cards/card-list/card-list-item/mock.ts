import type { RightContentType, ButtonEventHandlerMap } from '@/data-display/cards/card-list/card-list-item/type';

export const cardListItemButtonSet: RightContentType[] = ['EDIT', 'DUPLICATE', 'TRASHCAN'];

export const getButtonEventHandlerMap = (typeSet: RightContentType[]): ButtonEventHandlerMap => {
    const results = {} as ButtonEventHandlerMap;
    typeSet.forEach((item) => {
        results[item] = () => {};
    });
    return results;
};
