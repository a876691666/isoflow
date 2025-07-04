import { ref, onUnmounted, watch } from 'vue';
import { useModelStore } from 'src/stores/modelStore';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { ModeActions, State, SlimMouseEvent } from 'src/types';
import { getMouse, getItemAtTile } from 'src/utils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useScene } from 'src/hooks/useScene';
import { Cursor } from './modes/Cursor';
import { DragItems } from './modes/DragItems';
import { DrawRectangle } from './modes/Rectangle/DrawRectangle';
import { TransformRectangle } from './modes/Rectangle/TransformRectangle';
import { Connector } from './modes/Connector';
import { Pan } from './modes/Pan';
import { PlaceIcon } from './modes/PlaceIcon';
import { TextBox } from './modes/TextBox';

const modes: { [k in string]: ModeActions } = {
  CURSOR: Cursor,
  DRAG_ITEMS: DragItems,
  // TODO: Adopt this notation for all modes (i.e. {node.type}.{action})
  'RECTANGLE.DRAW': DrawRectangle,
  'RECTANGLE.TRANSFORM': TransformRectangle,
  CONNECTOR: Connector,
  PAN: Pan,
  PLACE_ICON: PlaceIcon,
  TEXTBOX: TextBox
};

const getModeFunction = (mode: ModeActions, e: SlimMouseEvent) => {
  switch (e.type) {
    case 'mousemove':
      return mode.mousemove;
    case 'mousedown':
      return mode.mousedown;
    case 'mouseup':
      return mode.mouseup;
    default:
      return null;
  }
};

export const useInteractionManager = () => {
  const rendererRef = ref<HTMLElement>();
  const reducerTypeRef = ref<string>();
  const uiStateStore = useUiStateStore();
  const modelStore = useModelStore();
  const scene = useScene();
  const { size: rendererSize } = useResizeObserver(uiStateStore.rendererEl);

  const onMouseEvent = (e: SlimMouseEvent) => {
    if (!rendererRef.value) return;

    const mode = modes[uiStateStore.mode.type];
    const modeFunction = getModeFunction(mode, e);

    if (!modeFunction) return;

    const nextMouse = getMouse({
      interactiveElement: rendererRef.value,
      zoom: uiStateStore.zoom,
      scroll: uiStateStore.scroll,
      lastMouse: uiStateStore.mouse,
      mouseEvent: e,
      rendererSize: rendererSize.value
    });

    uiStateStore.setMouse(nextMouse);

    const baseState: State = {
      model: modelStore.$state,
      scene: scene,
      uiState: uiStateStore.$state,
      rendererRef: rendererRef.value,
      rendererSize: rendererSize.value,
      isRendererInteraction: rendererRef.value === e.target
    };

    if (reducerTypeRef.value !== uiStateStore.mode.type) {
      const prevReducer = reducerTypeRef.value
        ? modes[reducerTypeRef.value]
        : null;

      if (prevReducer && prevReducer.exit) {
        prevReducer.exit(baseState);
      }

      if (mode.entry) {
        mode.entry(baseState);
      }
    }

    modeFunction(baseState);
    reducerTypeRef.value = uiStateStore.mode.type;
  };

  const onContextMenu = (e: SlimMouseEvent) => {
    e.preventDefault();

    const itemAtTile = getItemAtTile({
      tile: uiStateStore.mouse.position.tile,
      scene
    });

    if (itemAtTile?.type === 'RECTANGLE') {
      uiStateStore.setContextMenu({
        item: itemAtTile,
        tile: uiStateStore.mouse.position.tile
      });
    } else if (uiStateStore.contextMenu) {
      uiStateStore.setContextMenu(null);
    }
  };

  const setupEventListeners = () => {
    if (uiStateStore.mode.type === 'INTERACTIONS_DISABLED') return;

    const el = window;

    const onTouchStart = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousedown'
      } as any);
    };

    const onTouchMove = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousemove'
      } as any);
    };

    const onTouchEnd = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: 0,
        clientY: 0,
        type: 'mouseup'
      } as any);
    };

    const onScroll = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        uiStateStore.decrementZoom();
      } else {
        uiStateStore.incrementZoom();
      }
    };

    el.addEventListener('mousemove', onMouseEvent as any);
    el.addEventListener('mousedown', onMouseEvent as any);
    el.addEventListener('mouseup', onMouseEvent as any);
    el.addEventListener('contextmenu', onContextMenu as any);
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    uiStateStore.rendererEl?.addEventListener('wheel', onScroll);

    return () => {
      el.removeEventListener('mousemove', onMouseEvent as any);
      el.removeEventListener('mousedown', onMouseEvent as any);
      el.removeEventListener('mouseup', onMouseEvent as any);
      el.removeEventListener('contextmenu', onContextMenu as any);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      uiStateStore.rendererEl?.removeEventListener('wheel', onScroll);
    };
  };

  let cleanupListeners: (() => void) | null = null;

  // 监听相关状态变化，重新设置事件监听器
  watch(
    () => [
      uiStateStore.editorMode,
      uiStateStore.mode.type,
      uiStateStore.rendererEl
    ],
    () => {
      if (cleanupListeners) {
        cleanupListeners();
      }
      cleanupListeners = setupEventListeners();
    },
    { immediate: true, deep: true }
  );

  onUnmounted(() => {
    if (cleanupListeners) {
      cleanupListeners();
    }
  });

  const setInteractionsElement = (element: HTMLElement) => {
    rendererRef.value = element;
  };

  return {
    setInteractionsElement
  };
};
