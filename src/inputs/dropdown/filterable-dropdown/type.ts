import type { MenuItem } from '@/inputs/context-menu/type';

interface HandlerRes {
    results: MenuItem[];
    totalCount?: number;
}
export type AutocompleteHandler = (inputText: string, list: MenuItem[]) => Promise<HandlerRes>|HandlerRes;

export const FILTERABLE_DROPDOWN_TYPE = Object.freeze({
    default: 'default',
    radioButton: 'radioButton',
} as const);

export type FILTERABLE_DROPDOWN_TYPE = typeof FILTERABLE_DROPDOWN_TYPE[keyof typeof FILTERABLE_DROPDOWN_TYPE];

export type FilterableDropdownMenuItem = MenuItem;