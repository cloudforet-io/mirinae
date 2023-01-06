import { createLocalVue, mount } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';
import { defineComponent, ref } from 'vue';

import { expect } from 'vitest';

import type { UseContextMenuControllerOptions, UseContextMenuControllerReturns } from '@/hooks/context-menu-controller';
import { useContextMenuController } from '@/hooks/context-menu-controller';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';

const localVue = createLocalVue();

type ContextMenuComponent = ComponentPublicInstance<typeof PContextMenu>;
const $t = () => {};

const mockLoadComposableInApp = (getOptions: () => Partial<UseContextMenuControllerOptions>, additional: { menu?: MenuItem[]} = {}) => {
    let result: UseContextMenuControllerReturns|undefined;
    let error;
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

    const mockComponent = defineComponent({
        components: {
            PContextMenu,
        },
        setup() {
            const options = getOptions();
            try {
                result = useContextMenuController(options as UseContextMenuControllerOptions);
            } catch (e) {
                error = e;
            }

            const targetRef = options.targetRef;
            const contextMenuRef = options.contextMenuRef;
            const visibleMenu = result?.visibleMenu;
            const fixedMenuStyle = result?.fixedMenuStyle;
            const menu = additional.menu ?? result?.refinedMenu ?? [];

            return {
                targetRef,
                contextMenuRef,
                visibleMenu,
                fixedMenuStyle,
                menu,
            };
        },
        template: `
            <div>
                <button ref="targetRef">target</button>
                <p-context-menu v-show="visibleMenu" 
                                ref="contextMenuRef"
                                id="menu"
                                :menu="menu"
                                :style="fixedMenuStyle"
                />
            </div>
        `,
    });
    const wrapper = mount(mockComponent, {
        localVue,
        attachTo: '#root', // this is for testing focus status
        mocks: {
            $t,
        },
    });
    return { result, error, wrapper };
};

describe('Context Menu Controller', () => {
    describe('useContextMenuController()', () => {
        it('should emit error if targetRef, contextMenu are not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({}));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if useReorderBySelection is given but originMenu is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                useReorderBySelection: true,
                selected: [],
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if useReorderBySelection is true but selected is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                useReorderBySelection: true,
                originMenu: [],
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if filterable is true but searchText is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                filterable: true,
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if filterable is true, handler and disableHandler are not given, but originMenu is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                filterable: true,
                searchText: ref(''),
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
    });

    describe('Features: ', () => {
        describe('Control menu visibility: ', () => {
            const { result, wrapper } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(false),
            }));
            const { showContextMenu, hideContextMenu } = result as UseContextMenuControllerReturns;
            const contextMenuElement = wrapper.find('#menu');
            it('showContextMenu() should make menu visible.', async () => {
                expect(contextMenuElement?.isVisible()).toBeFalsy();
                showContextMenu();
                await localVue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeTruthy();
            });
            it('hideContextMenu() should hide menu.', async () => {
                hideContextMenu();
                await localVue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeFalsy();
            });
        });


        describe('Get fixed context menu style: ', () => {
            const { result } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
                useFixedStyle: true,
            }));
            const { fixedMenuStyle } = result as UseContextMenuControllerReturns;
            it('fixedMenuStyle should be exist if useFixedStyle option is true.', () => {
                expect(fixedMenuStyle).toBeTruthy();
            });
        });

        describe('Control focusing on menu: ', () => {
            const { result } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
            }), { menu: [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'c', label: 'C' }] });
            const { focusOnContextMenu } = result as UseContextMenuControllerReturns;
            it('focusOnContextMenu() should focus on context menu element.', async () => {
                expect(document.activeElement?.id).toBeFalsy();
                focusOnContextMenu();
                await localVue.nextTick();
                expect(document.activeElement?.id).toBeTruthy();
            });
        });

        describe('Reorder menu items based on selection: ', () => {
            const mockLoadForReorderTest = (options: Partial<UseContextMenuControllerOptions> = {}) => {
                const { result, error } = mockLoadComposableInApp(() => ({
                    targetRef: ref<HTMLElement|null>(null),
                    contextMenuRef: ref<ContextMenuComponent|null>(null),
                    visibleMenu: ref(true),
                    ...options,
                }));
                if (error) throw error;
                return result as UseContextMenuControllerReturns;
            };
            describe('with useReorderBySelection option true: ', () => {
                const selected = ref([{ name: 'a' }]);
                const originMenu = ref([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                const visibleMenu = ref(false);
                const {
                    refinedMenu, showContextMenu,
                } = mockLoadForReorderTest({
                    visibleMenu,
                    useReorderBySelection: true,
                    originMenu,
                    selected,
                });
                it('refinedMenu should NOT be rearranged by executing showContextMenu() when the visibleMenu is already true.', async () => {
                    visibleMenu.value = true;
                    await showContextMenu();
                    expect(refinedMenu.value.map((d) => d.name)).not.toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                });
                it('refinedMenu should be rearranged by executing showContextMenu() when the visibleMenu is false.', async () => {
                    visibleMenu.value = false;
                    await showContextMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                });
                describe('if visibleMenu is false: ', () => {
                    it('refinedMenu should be updated by executing showContextMenu() after making changes to the selected ref.', async () => {
                        visibleMenu.value = false;
                        selected.value = [];
                        await showContextMenu();
                        expect(originMenu.value.map((d) => d.name)).toEqual(refinedMenu.value.map((d) => d.name));
                        visibleMenu.value = false;
                        selected.value = [{ name: 'b' }, { name: 'a' }];
                        await showContextMenu();
                        expect(refinedMenu.value.map((d) => d.name)).toEqual(['b', 'a', 'selection-divider', 'c', 'd', 'e']);
                    });
                    it('refinedMenu should be the same with origin if there is no selected item even if after executing showContextMenu().', async () => {
                        visibleMenu.value = false;
                        selected.value = [];
                        originMenu.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                        await showContextMenu();
                        expect(originMenu.value.map((d) => d.name)).toEqual(refinedMenu.value.map((d) => d.name));
                    });
                    it('refinedMenu should be rearranged so that the selected items are at the front by running showContextMenu().', async () => {
                        visibleMenu.value = false;
                        selected.value = [{ name: 'b' }, { name: 'a' }];
                        originMenu.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                        await showContextMenu();
                        expect(refinedMenu.value.map((d) => d.name)).toEqual(['b', 'a', 'selection-divider', 'c', 'd', 'e']);
                    });
                });
            });
        });
    });
});
