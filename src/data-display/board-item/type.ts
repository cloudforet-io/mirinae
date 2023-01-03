import type { TranslateResult } from 'vue-i18n';

export interface BoardItemProps {
    rounded?: boolean;
    leftIcon?: string;
    iconButtonSets?: IconSet[];
    selected?: boolean;
}

export type ButtonEventHandler = (...args: any[] | any) => Promise<void> | void;

export interface IconSet {
    iconName: string;
    tooltipText?: TranslateResult;
    eventAction: ButtonEventHandler;
}
