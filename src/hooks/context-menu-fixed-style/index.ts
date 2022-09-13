import type { ComponentRenderProxy, ComputedRef } from 'vue';
import {
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import type { ResizeObserverEntry } from '@juggle/resize-observer';
import { ResizeObserver } from '@juggle/resize-observer';
import { throttle } from 'lodash';

import { makeOptionalProxy } from '@/util/composition-helpers';

export interface ContextMenuFixedStyleProps {
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
}

interface StateArgs {
    useFixedMenuStyle?: ComputedRef<boolean|undefined> | boolean;
    visibleMenu?: ComputedRef<boolean|undefined> | boolean;
}

const isScrollable = (ele: Element) => {
    const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
};

const getScrollableParent = (ele?: Element|null): Element => {
    if (!ele || ele === document.body) return document.body;
    return isScrollable(ele) ? ele : getScrollableParent(ele.parentElement);
};

export const useContextMenuFixedStyle = ({ useFixedMenuStyle, visibleMenu }: StateArgs) => {
    const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
    const state = reactive({
        useFixedMenuStyle,
        visibleMenu,
    });
    const contextMenuFixedStyleState = reactive({
        proxyVisibleMenu: makeOptionalProxy('visibleMenu', vm, false),
        targetRef: null as Vue|Element|null,
        targetElement: computed<Element|null>(() => (contextMenuFixedStyleState.targetRef as Vue)?.$el ?? contextMenuFixedStyleState.targetRef),
        contextMenuStyle: {},
    });

    const hideMenu = throttle(() => {
        if (contextMenuFixedStyleState.proxyVisibleMenu) contextMenuFixedStyleState.proxyVisibleMenu = false;
    }, 300);

    const setStyleOfContextMenu = () => {
        const targetRects: DOMRect = contextMenuFixedStyleState.targetElement?.getBoundingClientRect();

        const contextMenuStyle: Partial<CSSStyleDeclaration> = {
            overflowY: 'auto',
            height: 'auto',
            minHeight: '32px',
        };

        if (state.useFixedMenuStyle) {
            contextMenuStyle.position = 'fixed';
            contextMenuStyle.width = 'auto';
            contextMenuStyle.minWidth = `${targetRects.width}px`;
            contextMenuStyle.maxWidth = '100%';
        }

        if (window.innerHeight * 0.9 > (targetRects.bottom)) {
            const height = window.innerHeight - targetRects.bottom - 12;
            contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
            if (state.useFixedMenuStyle) contextMenuStyle.top = `${targetRects.bottom}px`;
            else contextMenuStyle.top = `${targetRects.height}px`;
        } else {
            const height = targetRects.top - 12;
            contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
            if (state.useFixedMenuStyle) contextMenuStyle.bottom = `${targetRects.top}px`;
            else contextMenuStyle.bottom = `${targetRects.height}px`;
        }

        contextMenuFixedStyleState.contextMenuStyle = contextMenuStyle;
    };

    watch(() => contextMenuFixedStyleState.proxyVisibleMenu, async () => {
        if (!contextMenuFixedStyleState.proxyVisibleMenu || !contextMenuFixedStyleState.targetRef) {
            contextMenuFixedStyleState.contextMenuStyle = {};
        }

        await vm.$nextTick(); // Needed codes for timing issues between painting DOM and proxyVisibleMenu

        setStyleOfContextMenu();
    }, { immediate: true });

    if (state.useFixedMenuStyle) {
        let scrollParent: Element|undefined;
        watch(() => contextMenuFixedStyleState.targetElement, (targetElement) => {
            if (targetElement) {
                scrollParent = getScrollableParent(targetElement.parentElement);
                if (scrollParent) {
                    scrollParent.addEventListener('scroll', hideMenu);
                }
            } else if (scrollParent) {
                scrollParent.removeEventListener('scroll', hideMenu);
            }
        });

        onMounted(() => {
            window.addEventListener('resize', hideMenu);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', hideMenu);
        });
    }

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        entries.forEach(() => {
            setStyleOfContextMenu();
        });
    });

    onMounted(() => {
        observer.observe(contextMenuFixedStyleState.targetElement);
    });

    return {
        ...toRefs(contextMenuFixedStyleState),
    };
};
