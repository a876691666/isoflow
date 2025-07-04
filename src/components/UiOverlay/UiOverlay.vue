<template>
  <div class="ui-overlay">
    <!-- Item Controls -->
    <div
      v-if="
        availableTools.includes('ITEM_CONTROLS') && uiStateStore.itemControls
      "
      class="ui-element item-controls"
      :style="{
        left: `${appPadding.x}px`,
        top: `${appPadding.y * 2 + 16}px`,
        maxHeight: `${rendererSize.height - appPadding.y * 6}px`
      }"
    >
      <ItemControlsManager />
    </div>

    <!-- Tool Menu -->
    <div
      v-if="availableTools.includes('TOOL_MENU')"
      class="tool-menu-container"
      :style="{
        left: `${rendererSize.width - appPadding.x}px`,
        top: `${appPadding.y}px`
      }"
    >
      <ToolMenu />
    </div>

    <!-- Zoom Controls -->
    <div
      v-if="availableTools.includes('ZOOM_CONTROLS')"
      class="zoom-controls-container"
      :style="{
        top: `${rendererSize.height - appPadding.y * 2}px`,
        left: `${appPadding.x}px`
      }"
    >
      <ZoomControls />
    </div>

    <!-- Main Menu -->
    <div
      v-if="availableTools.includes('MAIN_MENU')"
      class="main-menu-container"
      :style="{
        top: `${appPadding.y}px`,
        left: `${appPadding.x}px`
      }"
    >
      <MainMenu />
    </div>

    <!-- View Title -->
    <div
      v-if="availableTools.includes('VIEW_TITLE')"
      class="view-title-container"
      :style="{
        left: `${rendererSize.width / 2}px`,
        top: `${rendererSize.height - appPadding.y * 2}px`,
        width: `${rendererSize.width - 500}px`,
        height: `${appPadding.y}px`
      }"
    >
      <div class="ui-element view-title">
        <div class="title-stack">
          <span class="title-text">{{ modelStore.title }}</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" width="24" height="24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
          <span class="title-text">{{ currentView?.name }}</span>
        </div>
      </div>
    </div>

    <!-- Debug Tools -->
    <div
      v-if="uiStateStore.enableDebugTools"
      class="ui-element debug-tools"
      :style="{
        maxWidth: `calc(${rendererSize.width}px - ${appPadding.x * 2}px)`,
        left: `${appPadding.x}px`,
        top: `${rendererSize.height - appPadding.y * 2 - 8}px`
      }"
    >
      <DebugUtils />
    </div>

    <!-- Drag and Drop for Place Icon Mode -->
    <SceneLayer
      v-if="uiStateStore.mode.type === 'PLACE_ICON' && uiStateStore.mode.id"
      :disable-animation="true"
    >
      <DragAndDrop
        :icon-id="uiStateStore.mode.id"
        :tile="uiStateStore.mouse.position.tile"
      />
    </SceneLayer>

    <!-- Export Image Dialog -->
    <ExportImageDialog
      v-if="uiStateStore.dialog === 'EXPORT_IMAGE'"
      @close="uiStateStore.setDialog(null)"
    />

    <!-- Context Menu -->
    <SceneLayer>
      <div ref="contextMenuAnchorRef" />
      <ContextMenuManager :anchor-el="contextMenuAnchorRef" />
    </SceneLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModelStore } from 'src/stores/modelStore';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useScene } from 'src/hooks/useScene';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { EditorModeEnum } from 'src/types';

// Import components (these would need to be converted too)
import ItemControlsManager from 'src/components/ItemControls/ItemControlsManager.vue';
import ToolMenu from 'src/components/ToolMenu/ToolMenu.vue';
import ZoomControls from 'src/components/ZoomControls/ZoomControls.vue';
import MainMenu from 'src/components/MainMenu/MainMenu.vue';
import DebugUtils from 'src/components/DebugUtils/DebugUtils.vue';
import SceneLayer from 'src/components/SceneLayer/SceneLayer.vue';
import DragAndDrop from 'src/components/DragAndDrop/DragAndDrop.vue';
import ExportImageDialog from 'src/components/ExportImageDialog/ExportImageDialog.vue';
import ContextMenuManager from 'src/components/ContextMenu/ContextMenuManager.vue';

const ToolsEnum = {
  MAIN_MENU: 'MAIN_MENU',
  ZOOM_CONTROLS: 'ZOOM_CONTROLS',
  TOOL_MENU: 'TOOL_MENU',
  ITEM_CONTROLS: 'ITEM_CONTROLS',
  VIEW_TITLE: 'VIEW_TITLE'
} as const;

const EDITOR_MODE_MAPPING = {
  [EditorModeEnum.EDITABLE]: [
    'ITEM_CONTROLS',
    'ZOOM_CONTROLS',
    'TOOL_MENU',
    'MAIN_MENU',
    'VIEW_TITLE'
  ],
  [EditorModeEnum.EXPLORABLE_READONLY]: ['ZOOM_CONTROLS', 'VIEW_TITLE'],
  [EditorModeEnum.NON_INTERACTIVE]: []
};

// Stores
const modelStore = useModelStore();
const uiStateStore = useUiStateStore();

// Hooks
const { currentView } = useScene();
const { size: rendererSize } = useResizeObserver(uiStateStore.rendererEl);

// Template refs
const contextMenuAnchorRef = ref<HTMLElement>();

// Available tools based on editor mode
const availableTools = ref<string[]>([]);

const updateAvailableTools = () => {
  availableTools.value = EDITOR_MODE_MAPPING[uiStateStore.editorMode] || [];
};

// Watch for editor mode changes
watch(() => uiStateStore.editorMode, updateAvailableTools, { immediate: true });

// Theme values (hardcoded for now, could be moved to a composable)
const appPadding = {
  x: 16,
  y: 16
};
</script>

<style scoped>
.ui-overlay {
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
}

.ui-element {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-controls {
  position: absolute;
  width: 360px;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.item-controls::-webkit-scrollbar {
  display: none; /* WebKit */
}

.tool-menu-container {
  position: absolute;
  transform: translateX(-100%);
}

.zoom-controls-container {
  position: absolute;
  transform-origin: bottom left;
}

.main-menu-container {
  position: absolute;
}

.view-title-container {
  position: absolute;
  display: flex;
  justify-content: center;
  transform: translateX(-50%);
  pointer-events: none;
}

.view-title {
  display: inline-flex;
  padding: 0 16px;
  align-items: center;
  height: 100%;
}

.title-stack {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 600;
  color: #666;
}

.chevron-icon {
  fill: #666;
  margin: 0 4px;
}

.debug-tools {
  position: absolute;
  width: 350px;
  transform: translateY(-100%);
}
</style>
