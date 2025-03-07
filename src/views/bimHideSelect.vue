
<template>
  <!-- <el-button @click="reset">恢复</el-button> -->
  <div id="cesiumContainer" class="fullSize"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";




onMounted(() => {
  init()

})
function init() {
  const viewModel = {
    header: 1.35,
    pitch: 0,
    roll: 0
  }
  const position = Cesium.Cartesian3.fromDegrees(
    113.57148, 22.76804, 0
  );
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, viewModel.roll)
  )
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;
  const url = "/api/draco/draco-GZ_04_0031_仲贵祖祠_模型.gltf";

  const entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      // color: new Cesium.Color(1, 0, 0, 1)
    },
  });
  window.entity = entity
  // viewer.trackedEntity = entity;
  viewer.flyTo(entity)

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let color = null
  let pickPrimitives
  handler.setInputAction(function (movement) {
    let position = viewer.camera.pickEllipsoid(
      movement.position,
      viewer.scene.globe.ellipsoid
    );
    const pick = viewer.scene.pick(movement.position);
    // console.log(pick);
    //隐藏构件
    pick.detail.node.show = false

    // pick.detail.node.runtimePrimitive[0].primitive
    // pick.primitive.material.uniforms.color=Cesium.Color.BLUE
    // const name = pick?.detail?.node?._name;
    // if (!name) {
    // } else {

    //   let id = name.replace('product-', '').replace('-body', '').toUpperCase()
    //   let res = propertySheet.find(obj => {
    //     return obj.guid == id
    //   })
    // }
    // console.log(color);
    // if (color) {
    //   console.log(color);
    //   pickPrimitives.map(item => {
    //     item.material.metallicRoughness.baseColorFactor = color
    //   })
    // }

    // var modelPrimitives = pick.detail.model
    // // var modelPrimitives = viewer.scene.primitives._primitives[1];
    // pickPrimitives = modelPrimitives.getNode(name)._runtimeNode.node.primitives
    // // console.log(pickPrimitives);
    // pickPrimitives.map(item => {
    //   color = item.material.metallicRoughness.baseColorFactor
    //   // console.log(item.material.metallicRoughness.baseColorFactor);
    //   item.material.metallicRoughness.baseColorFactor = Cesium.Cartesian4.fromColor(Cesium.Color.RED);
    // })

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


</script>

<style scoped lang="scss">
#cesiumContainer {
  position: relative;
  height: 98vh;
  width: 100vw;
}

.info {
  width: 600px;
  // height: 400px;
  background: #fff;
  position: absolute;
  left: 0;
  top: 0;

  .item {
    height: 30px;
    line-height: 30px;
  }
}
</style>
