import { ref, watch } from 'vue';
import { useUiStateStore } from '@/stores/uiStateStore';
import type { Size, Coords } from '@/types';
import {
  getUnprojectedBounds as getUnprojectedBoundsUtil,
  getFitToViewParams as getFitToViewParamsUtil,
  CoordsUtils
} from '@/utils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';

export const useDiagramUtils = () => {
  const uiStateStore = useUiStateStore();
  const rendererEl = ref<HTMLElement | null>(null);
  const { size: rendererSize } = useResizeObserver(rendererEl);

  // 更新渲染器元素引用
  watch(
    () => uiStateStore.rendererEl,
    (newEl) => {
      rendererEl.value = newEl;
    },
    { immediate: true }
  );

  const getUnprojectedBounds = (): Size & Coords => {
    // 这里需要当前视图数据，暂时返回默认值
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  const getFitToViewParams = (viewportSize: Size) => {
    // 这里需要当前视图数据，暂时返回默认值
    return { zoom: 1, scroll: { x: 0, y: 0 } };
  };

  const fitToView = async () => {
    const { zoom, scroll } = getFitToViewParams(rendererSize.value);

    uiStateStore.setScroll({
      position: scroll,
      offset: CoordsUtils.zero()
    });
    uiStateStore.setZoom(zoom);
  };

  return {
    getUnprojectedBounds,
    fitToView,
    getFitToViewParams
  };
};
