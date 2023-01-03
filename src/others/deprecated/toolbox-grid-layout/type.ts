import type { GridLayoutProps } from '@/others/deprecated/grid-layout/type';


export interface ToolboxGridLayoutProps extends GridLayoutProps {
    paginationVisible: boolean;
    pageSizeVisible: boolean;
    refreshVisible: boolean;
    allPage: number;
    paginationValues?: number[];
    pageSize?: number;
    thisPage?: number;
}
