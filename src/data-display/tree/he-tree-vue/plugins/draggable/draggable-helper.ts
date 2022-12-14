import {
    addClass, backupAttr, elementsFromPoint,
    findParent,
    getViewportPosition,
    hasClass, isDescendantOf,
    objectAssignIfKeyNull, removeEl, restoreAttr, scrollTo,
    toArrayIfNot,
} from '@/data-display/tree/he-tree-vue/helpers';

import DragEventService, { EventPosition, MouseOrTouchEvent } from './drag-event-service';
import { Store } from './draggable-types';

/* Default export, a function.
```js
import draggableHelper from 'draggable-helper'
draggableHelper(listenerElement, options)
```
Arguments:
  listenerElement: HTMLElement. The element to bind mouse and touch event listener.
  options: Options. Optional.
 */
/* Default export, a method.
```js
import draggableHelper from 'draggable-helper'
draggableHelper(listenerElement, options)
```
parameter:
  listenerElement: HTMLElement. HTML elements to bind mouse and touch event listeners.
  options: Options.
 */
const _edgeScroll = {
    afterFirstMove: undefined,
    afterMove,
    afterDrop,
};
export default function (listenerElement: HTMLElement, opt: Options) {
    let store: Store;
    // set default value of options
    objectAssignIfKeyNull(opt, defaultOptions);
    // define the event listener of mousedown and touchstart
    const onMousedownOrTouchStart = (e:MouseOrTouchEvent, mouse: EventPosition) => {
    // execute native event hooks
        if (!DragEventService.isTouch(e)) {
            if (opt.onmousedown) opt.onmousedown(e as MouseEvent);
        } else if (opt.ontouchstart) opt.ontouchstart(e as TouchEvent);
        const target = e.target as HTMLElement;
        // check if triggered by ignore tags
        if (opt.ingoreTags?.includes(target.tagName)) {
            return;
        }
        // check if trigger element and its parent has undraggable class name
        if (opt.undraggableClassName && hasClass(target, opt.undraggableClassName)) {
            return;
        }
        const isParentUndraggable = findParent(target, (el) => {
            if (opt.undraggableClassName && hasClass(el, opt.undraggableClassName)) {
                return true;
            }
            if (el === listenerElement) {
                return 'break';
            }
            return undefined;
        });
        if (isParentUndraggable) {
            return;
        }
        // Initialize store. Store start event, initial position
        store = JSON.parse(JSON.stringify(initialStore));
        store.startEvent = e;
        store.listenerElement = listenerElement;
        store.directTriggerElement = target;
        store.initialMouse = { ...mouse };
        // get triggerElement
        let triggerElementIsMovedOrClonedElement = false;
        if (opt.getTriggerElement) {
            const el = opt.getTriggerElement(store.directTriggerElement, store);
            if (!el) {
                return;
            }
            store.triggerElement = el;
        } else if (opt.triggerClassName) {
            let triggerElement;
            // eslint-disable-next-line no-restricted-syntax
            for (const className of toArrayIfNot(opt.triggerClassName)) {
                triggerElement = findParent(store.directTriggerElement, (el) => {
                    if (hasClass(el, <string>className)) {
                        return true;
                    }
                    if (el === listenerElement) {
                        return 'break';
                    }
                    return undefined;
                }, { withSelf: true });
                if (triggerElement) {
                    break;
                }
            }
            if (!triggerElement) {
                return;
            }
            store.triggerElement = triggerElement;
        } else {
            triggerElementIsMovedOrClonedElement = true;
        }
        // get movedOrClonedElement
        store.movedOrClonedElement = opt.getMovedOrClonedElement ? opt.getMovedOrClonedElement(store.directTriggerElement, store, opt) : listenerElement;
        if (!store.movedOrClonedElement) {
            return;
        }
        if (triggerElementIsMovedOrClonedElement) {
            store.triggerElement = store.movedOrClonedElement;
        }
        // check if trigger element is same with directTriggerElement when options.triggerBySelf is true
        if (opt.triggerBySelf && store.triggerElement !== store.directTriggerElement) {
            return;
        }
        // prevent text be selected
        if (!DragEventService.isTouch(e)) {
            // Do not prevent when touch. Or the elements within the node can not trigger click event.
            if (opt.preventTextSelection) {
                e.preventDefault();
            }
        }
        // listen mousemove and touchmove
        DragEventService.on(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        // listen mouseup and touchend
        DragEventService.on(window, 'end', onMouseupOrTouchEnd);
    };
    // bind mousedown or touchstart event listener
    DragEventService.on(listenerElement, 'start', onMousedownOrTouchStart, { touchArgs: [{ passive: true }] });

    // define the event listener of mousemove and touchmove
    const onMousemoveOrTouchMove = (e: MouseOrTouchEvent, mouse: EventPosition) => {
    // execute native event hooks
        if (!DragEventService.isTouch(e)) {
            if (opt.onmousemove) opt.onmousemove(e as MouseEvent);
        } else if (opt.ontouchmove) opt.ontouchmove(e as TouchEvent);
        //
        const { movedOrClonedElement } = store;
        // calc move and attach related info to store
        const move = {
            x: mouse.clientX - store.initialMouse.clientX,
            y: mouse.clientY - store.initialMouse.clientY,
        };
        store.move = move;
        store.moveEvent = e;
        store.mouse = mouse;
        if (DragEventService.isTouch(e)) {
            // prevent page scroll when touch.
            e.preventDefault();
            // prevent text be selected
        } else if (opt.preventTextSelection) {
            e.preventDefault();
        }
        // first move
        if (store.movedCount === 0) {
            // check if min displacement exceeded.
            if (opt.minDisplacement) {
                const x2 = move.x ** 2;
                const y2 = move.y ** 2;
                const dtc = (x2 + y2) ** 0.5;
                if (dtc < opt.minDisplacement) {
                    return;
                }
            }
            // resolve elements
            store._isMovingElementCloned = Boolean(opt.clone && (!opt.onClone || opt.onClone(store, opt)));
            const movedElement = store._isMovingElementCloned ? movedOrClonedElement.cloneNode(true) as HTMLElement : movedOrClonedElement;
            if (store._isMovingElementCloned) {
                movedElement.setAttribute('id', '');
            }
            const initialPosition = getViewportPosition(movedOrClonedElement);
            // attach elements and initialPosition to store
            store.movedOrClonedElement = movedOrClonedElement;
            store.movedElement = movedElement;
            store.initialPositionRelativeToViewport = initialPosition;
            store.initialPosition = initialPosition;
            // define the function to update moved element style
            const updateMovedElementStyle = () => {
                if (store._isMovingElementCloned) {
                    if (store.movedOrClonedElement?.parentElement) store.movedOrClonedElement.parentElement.appendChild(movedElement);
                }
                const size = getViewportPosition(movedElement);
                const style = {
                    width: `${Math.ceil(size.width)}px`,
                    height: `${Math.ceil(size.height)}px`,
                    zIndex: 9999,
                    opacity: 0.8,
                    position: 'fixed',
                    left: `${initialPosition.x}px`,
                    top: `${initialPosition.y}px`,
                    pointerEvents: 'none',
                };
                backupAttr(movedElement, 'style');
                backupAttr(movedElement, 'class');
                backupAttr(document.body, 'style');
                // eslint-disable-next-line guard-for-in,no-restricted-syntax
                for (const key in style) {
                    movedElement.style[key] = style[key];
                }
                addClass(movedElement, opt.draggingClassName ?? '');
                document.body.style.cursor = 'grabbing';
                /*
        check if the changed position is expected and correct it. about stacking context.
        */
                const nowPosition = getViewportPosition(movedElement);
                if (nowPosition.x !== initialPosition.x) {
                    initialPosition.x -= (nowPosition.x - initialPosition.x);
                    initialPosition.y -= (nowPosition.y - initialPosition.y);
                    movedElement.style.left = `${initialPosition.x}px`;
                    movedElement.style.top = `${initialPosition.y}px`;
                }
            };
            store.updateMovedElementStyle = updateMovedElementStyle;
            // call hook beforeFirstMove, beforeMove
            if (opt.beforeFirstMove && opt.beforeFirstMove(store, opt) === false) {
                return;
            }
            if (opt.beforeMove && opt.beforeMove(store, opt) === false) {
                return;
            }
            // try to update moved element style
            if (!opt.updateMovedElementStyleManually) {
                store.updateMovedElementStyle();
            }
            // if (_edgeScroll.afterFirstMove) _edgeScroll.afterFirstMove(store, opt);
            if (opt.afterFirstMove) opt.afterFirstMove(store, opt);

            // Not the first move
        } else {
            // define the function to update moved element style
            const updateMovedElementStyle = () => {
                Object.assign(store.movedElement.style, {
                    left: `${store.initialPosition.x + move.x}px`,
                    top: `${store.initialPosition.y + move.y}px`,
                });
            };
            store.updateMovedElementStyle = updateMovedElementStyle;
            // call hook beforeMove
            if (opt.beforeMove && opt.beforeMove(store, opt) === false) {
                return;
            }
            // try to update moved element style
            if (!opt.updateMovedElementStyleManually) {
                store.updateMovedElementStyle();
            }
        }
        _edgeScroll.afterMove(store, opt);
        store.movedCount++;
        if (opt.afterMove) opt.afterMove(store, opt);
    };

    // define the event listener of mouseup and touchend
    const onMouseupOrTouchEnd = async (e: MouseOrTouchEvent) => {
    // execute native event hooks
        if (!DragEventService.isTouch(e)) {
            if (opt.onmousedown) opt.onmousedown(e as MouseEvent);
        } else if (opt.ontouchend) opt.ontouchend(e as TouchEvent);
        // cancel listening mousemove, touchmove, mouseup, touchend
        DragEventService.off(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        DragEventService.off(window, 'end', onMouseupOrTouchEnd);
        //
        if (store.movedCount === 0) {
            return;
        }
        store.endEvent = e;
        const { movedElement } = store;
        // define the function to update moved element style
        const updateMovedElementStyle = () => {
            restoreAttr(movedElement, 'style');
            restoreAttr(movedElement, 'class');
            restoreAttr(document.body, 'style');
            if (store._isMovingElementCloned) {
                removeEl(movedElement);
            }
        };
        store.updateMovedElementStyle = updateMovedElementStyle;
        // call hook beforeDrop
        if (opt.beforeDrop && (await opt.beforeDrop(store, opt)) === false) {
            return;
        }
        // try to update moved element style
        if (!opt.updateMovedElementStyleManually) {
            updateMovedElementStyle();
        }
        _edgeScroll.afterDrop(store, opt);
        if (opt.afterDrop) await opt.afterDrop(store, opt);
    };

    // define the destroy function
    const destroy = () => {
        DragEventService.off(listenerElement, 'start', onMousedownOrTouchStart, { touchArgs: [{ passive: true }] });
        DragEventService.off(document, 'move', onMousemoveOrTouchMove, { touchArgs: [{ passive: false }] });
        DragEventService.off(window, 'end', onMouseupOrTouchEnd);
    };
    //
    return { destroy, options: opt };
}


// available options and default options value
export const defaultOptions = {
    ingoreTags: ['INPUT', 'TEXTAREA', 'SELECT', 'OPTGROUP', 'OPTION'],
    undraggableClassName: 'undraggable',
    minDisplacement: 10, // The minimum displacement that triggers the drag.
    draggingClassName: 'dragging', // Be added to the dragged element.
    clone: false, // Whether to clone element when drag.
    updateMovedElementStyleManually: false, // If true, you may need to call store.updateMovedElementStyle in beforeFirstMove, beforeMove, beforeDrop
    preventTextSelection: true,
    edgeScrollTriggerMargin: 50,
    edgeScrollSpeed: 0.35,
    edgeScrollTriggerMode: 'top_left_corner',
};
export interface Options extends Partial<typeof defaultOptions>{
    triggerClassName?: string|string[] // triggerElement must have the class name.
    triggerBySelf?: boolean // directTriggerElement must be the triggerElement
    getTriggerElement?: (directTriggerElement: HTMLElement, store: Store) => HTMLElement|undefined // get triggerElement by directTriggerElement. override triggerClassName.
    getMovedOrClonedElement?: (directTriggerElement: HTMLElement, store: Store, opt: Options) => HTMLElement
    beforeFirstMove?: (store:Store, opt:Options) => boolean|undefined
    afterFirstMove?: (store:Store, opt:Options) => void
    beforeMove?: (store:Store, opt:Options) => boolean|undefined
    afterMove?: (store:Store, opt:Options) => void
    beforeDrop?: (store:Store, opt:Options) => boolean|undefined|Promise<boolean|void>
    afterDrop?: (store:Store, opt:Options) => void|Promise<void>
    preventTextSelection?: boolean
    rtl?: boolean;
    // edge scroll
    edgeScroll?: boolean
    edgeScrollTriggerMargin?: number
    edgeScrollSpeed?: number
    edgeScrollTriggerMode?: 'top_left_corner'|'mouse'
    edgeScrollSpecifiedContainerX?: HTMLElement|((store:Store, opt:Options) => HTMLElement)
    edgeScrollSpecifiedContainerY?: HTMLElement|((store:Store, opt:Options) => HTMLElement)
    // native event hooks
    onmousedown?: (e: MouseEvent) => void
    onmousemove?: (e: MouseEvent) => void
    onmouseup?: (e: MouseEvent) => void
    ontouchstart?: (e: TouchEvent) => void
    ontouchmove?: (e: TouchEvent) => void
    ontouchend?: (e: TouchEvent) => void
    // clone
    onClone?: (store: Store, opt: Options) => boolean; // control clone when drag start
}
// Info after event triggered. Created when mousedown or touchstart, destroied after mouseup or touchend.
export const initialStore = {
    movedCount: 0,
};

// edge scroll
let stopHorizontalScroll; let
    stopVerticalScroll;
function afterMove(store: Store, opt: Options) {
    if (!opt.edgeScroll) {
        return;
    }
    const margin = opt.edgeScrollTriggerMargin ?? 0;
    stopOldScrollAnimation();
    // get triggerPoint. The point trigger edge scroll.
    let triggerPoint = { x: store.mouse.clientX, y: store.mouse.clientY };
    if (opt.edgeScrollTriggerMode === 'top_left_corner') {
        const vp = getViewportPosition(store.movedElement);
        triggerPoint = { x: vp.x, y: vp.y };
    }
    //
    let foundHorizontal: HTMLElement|undefined;
    let foundVertical: HTMLElement|null|undefined;
    let prevElement: HTMLElement|null|undefined;
    let horizontalDir:'left'|'right'|undefined;
    let verticalDir:'up'|'down'|undefined;
    let findInElements: HTMLElement[]|null|undefined;
    let cachedElementsFromPoint: HTMLElement[]|null|undefined;
    // find x container
    const minScrollableDisplacement = 10;
    if (opt.edgeScrollSpecifiedContainerX) {
        let containerX;
        if (typeof opt.edgeScrollSpecifiedContainerX === 'function') {
            containerX = opt.edgeScrollSpecifiedContainerX(store, opt);
        } else {
            containerX = opt.edgeScrollSpecifiedContainerX;
        }
        if (containerX) {
            findInElements = [containerX];
        }
    }
    if (!findInElements) {
        findInElements = elementsFromPoint(triggerPoint.x, triggerPoint.y) as HTMLElement[];
        cachedElementsFromPoint = findInElements;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const itemEl of findInElements as HTMLElement[]) {
        if (prevElement && !isDescendantOf(prevElement, itemEl)) {
            // itemEl is being covered by other elements
            // eslint-disable-next-line no-continue
            continue;
        }
        const t = minScrollableDisplacement; // min scrollable displacement.
        if (!foundHorizontal) {
            if (itemEl.scrollWidth > itemEl.clientWidth) {
                const vp = fixedGetViewportPosition(itemEl);
                if (triggerPoint.x <= vp.left + margin) {
                    if (scrollableDisplacement(itemEl, 'left') as number > t && isScrollable(itemEl, 'x')) {
                        foundHorizontal = itemEl;
                        horizontalDir = 'left';
                    }
                } else if (triggerPoint.x >= vp.left + itemEl.clientWidth - margin) {
                    if (scrollableDisplacement(itemEl, 'right') as number > t && isScrollable(itemEl, 'x')) {
                        foundHorizontal = itemEl;
                        horizontalDir = 'right';
                    }
                }
            }
        }
        if (foundHorizontal) {
            break;
        }
        prevElement = itemEl;
    }
    prevElement = null;
    // find y container
    findInElements = null;
    if (opt.edgeScrollSpecifiedContainerY) {
        let containerY;
        if (typeof opt.edgeScrollSpecifiedContainerY === 'function') {
            containerY = opt.edgeScrollSpecifiedContainerY(store, opt);
        } else {
            containerY = opt.edgeScrollSpecifiedContainerY;
        }
        if (containerY) {
            findInElements = [containerY];
        }
    }
    if (!findInElements) {
        findInElements = cachedElementsFromPoint || elementsFromPoint(triggerPoint.x, triggerPoint.y) as HTMLElement[];
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const itemEl of findInElements) {
        if (prevElement && !isDescendantOf(prevElement, itemEl)) {
            // itemEl is being covered by other elements
            // eslint-disable-next-line no-continue
            continue;
        }
        const t = minScrollableDisplacement; // min scrollable displacement.
        if (!foundVertical) {
            if (itemEl.scrollHeight > itemEl.clientHeight) {
                const vp = fixedGetViewportPosition(itemEl);
                if (triggerPoint.y <= vp.top + margin) {
                    if (scrollableDisplacement(itemEl, 'up') as number > t && isScrollable(itemEl, 'y')) {
                        foundVertical = itemEl;
                        verticalDir = 'up';
                    }
                } else if (triggerPoint.y >= vp.top + itemEl.clientHeight - margin) {
                    if (scrollableDisplacement(itemEl, 'down') as number > t && isScrollable(itemEl, 'y')) {
                        foundVertical = itemEl;
                        verticalDir = 'down';
                    }
                }
            }
        }
        if (foundVertical) {
            break;
        }
        prevElement = itemEl;
    }
    // scroll
    if (foundHorizontal) {
        if (horizontalDir === 'left') {
            stopHorizontalScroll = scrollTo({
                x: 0,
                element: foundHorizontal,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundHorizontal, 'left') as number / opt.edgeScrollSpeed : 0,
            });
        } else {
            stopHorizontalScroll = scrollTo({
                x: foundHorizontal.scrollWidth - foundHorizontal.clientWidth,
                element: foundHorizontal,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundHorizontal, 'right') as number / opt.edgeScrollSpeed : 0,
            });
        }
    }
    if (foundVertical) {
        if (verticalDir === 'up') {
            stopVerticalScroll = scrollTo({
                y: 0,
                element: foundVertical,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundVertical, 'up') as number / opt.edgeScrollSpeed : 0,
            });
        } else {
            stopVerticalScroll = scrollTo({
                y: foundVertical.scrollHeight - foundVertical.clientHeight,
                element: foundVertical,
                duration: opt.edgeScrollSpeed ? scrollableDisplacement(foundVertical, 'down') as number / opt.edgeScrollSpeed : 0,
            });
        }
    }
    // is element scrollable in a direction
    function isScrollable(el:HTMLElement, dir:'x'|'y') {
        const style = getComputedStyle(el);
        const key = `overflow-${dir}`;
        // document.documentElement is special
        const special = document.scrollingElement || document.documentElement;
        if (el === special) {
            return style[key] === 'visible' || style[key] === 'auto' || style[key] === 'scroll';
        }
        return style[key] === 'auto' || style[key] === 'scroll';
    }
    // scrollable displacement of element  in a direction
    function scrollableDisplacement(el:HTMLElement, dir: 'up'|'down'|'left'|'right'): number|undefined {
        if (dir === 'up') {
            return el.scrollTop;
        } if (dir === 'down') {
            return el.scrollHeight - el.scrollTop - el.clientHeight;
        } if (dir === 'left') {
            return el.scrollLeft;
        } if (dir === 'right') {
            return el.scrollWidth - el.scrollLeft - el.clientWidth;
        }
        return undefined;
    }
    function fixedGetViewportPosition(el: HTMLElement) {
        const r = getViewportPosition(el);
        // document.documentElement is special
        const special = document.scrollingElement || document.documentElement;
        if (el === special) {
            r.top = 0;
            r.left = 0;
        }
        return r;
    }
}
function afterDrop(store: Store, opt: Options) {
    if (!opt.edgeScroll) {
        return;
    }
    stopOldScrollAnimation();
}

// stop old scroll animation
function stopOldScrollAnimation() {
    if (stopHorizontalScroll) {
        stopHorizontalScroll();
        stopHorizontalScroll = null;
    }
    if (stopVerticalScroll) {
        stopVerticalScroll();
        stopVerticalScroll = null;
    }
}
