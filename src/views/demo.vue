<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import TranslationController from '../model/TranslationController.js'

onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  init3dTiles()
})
async function init3dTiles() {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl("/api/xinzaoshengliangcang_3dtiles/tileset.json");
    const tempTranslation = new Cesium.Cartesian3(0,0,-30);
    const surface = tileset.boundingSphere.center;
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface);
    const offset = Cesium.Matrix4.multiplyByPoint(
      m,
      tempTranslation,
      new Cesium.Cartesian3(0, 0, 0)
    );
    const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(tileset);
    window.model = tileset;
    viewer.baseViewer = viewer
    new TranslationController(viewer, tileset)
  } catch (error) {
    console.error(`Error creating tileset: ${error}`);
  }

}

</script>

<style scoped lang="scss"></style>
