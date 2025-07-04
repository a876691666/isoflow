<template>
  <div
    ref="containerRef"
    class="renderer-container"
    :style="{
      backgroundColor: backgroundColor || '#f5f5f5'
    }"
  >
    <!-- Background rectangles -->
    <SceneLayer>
      <Rectangles :rectangles="rectangles" />
    </SceneLayer>

    <!-- Grid -->
    <div v-if="isShowGrid" class="grid-container">
      <Grid />
    </div>

    <!-- Cursor -->
    <SceneLayer v-if="uiStateStore.mode.showCursor">
      <Cursor />
    </SceneLayer>

    <!-- Connectors -->
    <SceneLayer>
      <Connectors :connectors="connectors" />
    </SceneLayer>

    <!-- Text Boxes -->
    <SceneLayer>
      <TextBoxes :text-boxes="textBoxes" />
    </SceneLayer>

    <!-- Connector Labels -->
    <SceneLayer>
      <ConnectorLabels :connectors="connectors" />
    </SceneLayer>

    <!-- Debug Size Indicator -->
    <SceneLayer v-if="uiStateStore.enableDebugTools">
      <SizeIndicator />
    </SceneLayer>

    <!-- Interaction layer for events -->
    <div ref="interactionsRef" class="interactions-layer" />

    <!-- Nodes/Items -->
    <SceneLayer>
      <Nodes :nodes="items" />
    </SceneLayer>

    <!-- Transform Controls -->
    <SceneLayer>
      <TransformControlsManager />
    </SceneLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useInteractionManager } from 'src/interaction/useInteractionManager';
import { useScene } from 'src/hooks/useScene';
import type { RendererProps } from 'src/types/rendererProps';

// Import components
import Grid from 'src/components/Grid/Grid.vue';
import Cursor from 'src/components/Cursor/Cursor.vue';
import Nodes from 'src/components/SceneLayers/Nodes/Nodes.vue';
import Rectangles from 'src/components/SceneLayers/Rectangles/Rectangles.vue';
import Connectors from 'src/components/SceneLayers/Connectors/Connectors.vue';
import ConnectorLabels from 'src/components/SceneLayers/ConnectorLabels/ConnectorLabels.vue';
import TextBoxes from 'src/components/SceneLayers/TextBoxes/TextBoxes.vue';
import SizeIndicator from 'src/components/DebugUtils/SizeIndicator.vue';
import SceneLayer from 'src/components/SceneLayer/SceneLayer.vue';
import TransformControlsManager from 'src/components/TransformControlsManager/TransformControlsManager.vue';

interface Props {
  showGrid?: RendererProps['showGrid'];
  backgroundColor?: RendererProps['backgroundColor'];
}

const props = withDefaults(defineProps<Props>(), {
  showGrid: true
});

// Template refs
const containerRef = ref<HTMLDivElement>();
const interactionsRef = ref<HTMLDivElement>();

// Stores and hooks
const uiStateStore = useUiStateStore();
const { setInteractionsElement } = useInteractionManager();
const { items, rectangles, connectors, textBoxes } = useScene();

// Show grid reactive value
const isShowGrid = ref(true);

const updateShowGrid = () => {
  isShowGrid.value = props.showGrid === undefined || props.showGrid;
};

// Watch for showGrid prop changes
watch(() => props.showGrid, updateShowGrid, { immediate: true });

onMounted(() => {
  if (!containerRef.value || !interactionsRef.value) return;

  setInteractionsElement(interactionsRef.value);
  uiStateStore.setRendererEl(containerRef.value);
});
</script>

<style scoped>
.renderer-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.grid-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.interactions-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
