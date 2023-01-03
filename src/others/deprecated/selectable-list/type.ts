import type { ThemeType } from '@/others/deprecated/selectable-item/type';

export type MapperKeyType = string | ((item: any) => string);
interface MapperType {
    key?: MapperKeyType;
    iconUrl?: MapperKeyType;
    title?: MapperKeyType;
    color?: MapperKeyType;
    icon?: MapperKeyType;
}

export interface SelectableListProps<Item=any> {
    items: Item[];
    mapper?: MapperType;
    multiSelectable?: boolean;
    mustSelect?: boolean;
    defaultIcon?: string;
    loading?: boolean;
    theme: ThemeType;
    selectedIndexes?: number[];
    disabledIndexes?: number[];
    disabled?: boolean;
    iconSize?: string;
}
