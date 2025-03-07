<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { lngLatHeightFromCartesian, MoveModelPosition, getCartesian3 } from "@/lib/cesiumUtils.js";

onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;
  init3dTiles()
  clickPrintlnglat()
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
    window.tileset = tileset;
  } catch (error) {
    console.error(`Error creating tileset: ${error}`);
  }
}
function clickPrintlnglat(){
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    let position = getCartesian3(movement.position);
    console.log(position);
    console.log(lngLatHeightFromCartesian(position));
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
// function postProcessFn(){
//   const silhouetteGreen =
//     Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
//   silhouetteGreen.uniforms.color = Cesium.Color.LIME;
//   silhouetteGreen.uniforms.length = 0.01;
//   silhouetteGreen.selected = [];

//   viewer.scene.postProcessStages.add(
//     Cesium.PostProcessStageLibrary.createSilhouetteStage([
//       silhouetteGreen
//     ]),
//   );
//   const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
//   handler.setInputAction((movement) => {
//     // If a feature was previously selected, undo the highlight
//     silhouetteGreen.selected = [];

//     // Pick a new feature
//     const pickedFeature = viewer.scene.pick(movement.position);

//     // Select the feature if it's not already selected
//     if (silhouetteGreen.selected[0] === pickedFeature) {
//       return;
//     }


//     console.log(silhouetteGreen,'silhouetteGreen');

//     // Highlight newly selected feature
//     silhouetteGreen.selected = [pickedFeature];

//     // Set feature infobox description
//     // viewer.selectedEntity = selectedEntity;
//     // selectedEntity.description = createPickedFeatureDescription(pickedFeature);
//   }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
// }
</script>

<style scoped lang="scss"></style>
