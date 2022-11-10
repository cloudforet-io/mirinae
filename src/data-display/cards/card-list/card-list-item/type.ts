
export const CARD_BUTTON_ICON_NAME_TYPE = {
    EDIT: 'ic_edit',
    DUPLICATE: 'ic_duplicate',
    TRASHCAN: 'ic_trashcan',
    CUSTOM: 'custom',
} as const;

export type RightContentType = keyof typeof CARD_BUTTON_ICON_NAME_TYPE;

export interface CardListItemProps {
    rounded: boolean;
    leftIcon: string;
    rightButtonSet: RightContentType[];
    buttonHandlerMap: ButtonEventHandlerMap;
}

export interface ButtonEventHandlerMap {
    [key: string]: ButtonEventHandler|undefined;
}

export type ButtonEventHandler = (...args: any[] | any) => Promise<void> | void;
