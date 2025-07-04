<template>
  <div
    class="transform-anchor"
    :style="anchorStyles"
    @mouseover="handleMouseOver"
    @mouseout="handleMouseOut"
    @mousedown="handleMouseDown"
  >
    <Svg :style="svgStyles">
      <g :transform="`translate(${strokeWidth}, ${strokeWidth})`">
        <rect
          :fill="fillColor"
          :width="rectSize"
          :height="rectSize"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
          rx="3"
        />
      </g>
    </Svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import type { Coords } from '@/types';
import Svg from '@/components/Svg/Svg.vue';

interface Props {
  position: Coords;
  onMouseDown: () => void;
}

const props = defineProps<Props>();

const isHovered = ref(false);
const anchorStyles = ref<CSSProperties>({});
const svgStyles = ref<CSSProperties>({});
const fillColor = ref('');
const strokeColor = ref('#333');
const strokeWidth = 2;

const TRANSFORM_ANCHOR_SIZE = 12;
const TRANSFORM_CONTROLS_COLOR = '#1976d2';

const rectSize = TRANSFORM_ANCHOR_SIZE - strokeWidth * 2;

const updateStyles = () => {
  anchorStyles.value = {
    position: 'absolute',
    transform: getIsoProjectionCss(),
    width: `${TRANSFORM_ANCHOR_SIZE}px`,
    height: `${TRANSFORM_ANCHOR_SIZE}px`,
    left: `${props.position.x - TRANSFORM_ANCHOR_SIZE / 2}px`,
    top: `${props.position.y - TRANSFORM_ANCHOR_SIZE / 2}px`,
    cursor: 'pointer'
  };

  svgStyles.value = {
    width: `${TRANSFORM_ANCHOR_SIZE}px`,
    height: `${TRANSFORM_ANCHOR_SIZE}px`
  };

  fillColor.value = isHovered.value ? '#1565c0' : 'white';
  strokeColor.value = TRANSFORM_CONTROLS_COLOR;
};

// 简化的等距投影CSS生成函数
const getIsoProjectionCss = () => {
  return 'matrix(0.866, 0.5, -0.866, 0.5, 0, 0)';
};

const handleMouseOver = () => {
  isHovered.value = true;
  updateStyles();
};

const handleMouseOut = () => {
  isHovered.value = false;
  updateStyles();
};

const handleMouseDown = () => {
  props.onMouseDown();
};

// 监听position变化
watch(() => props.position, updateStyles, { immediate: true, deep: true });

// 初始化样式
updateStyles();
</script>

<style scoped>
.transform-anchor {
  /* 变换锚点样式 */
}

.transform-anchor:hover {
  z-index: 10;
}
</style>
