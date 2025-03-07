<template>
  <div id="cesiumContainer" class="fullSize"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";


onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;
  init()
  movegltf()
})
function init() {
  const viewModel = {
    header: 1.35,
    pitch: 0,
    roll: 0
  }
  const position = Cesium.Cartesian3.fromDegrees(
    113.41274486612056,23.04266533915767, 0
  );
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, viewModel.roll)
  )

  const url = "/api/draco/无标题.glb";

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

}
function movegltf() {
  let size = 50

  let x = entity.position._value.x;
  let y = entity.position._value.y;
  let z = entity.position._value.z;

  // 获取当前模型的旋转矩阵
  var rotationMatrix = Cesium.Matrix3.fromQuaternion(
    entity.orientation._value
  );
  // 10 here is the distance to push the point away from the origin of the vehicle
  var offsetVectorX = new Cesium.Cartesian3(size, 0, 0);
  var offsetVectorY = new Cesium.Cartesian3(0, size, 0);
  var offsetVectorZ = new Cesium.Cartesian3(0, 0, size);
  // Apply the orientation to this vector
  offsetVectorX = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorX,
    offsetVectorX
  );
  offsetVectorY = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorY,
    offsetVectorY
  );
  offsetVectorZ = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorZ,
    offsetVectorZ
  );
  // Offset the dot's position by the computed vector
  var newPositionX = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  Cesium.Cartesian3.add(newPositionX, offsetVectorX, newPositionX);
  console.log(offsetVectorX,Cesium.Cartesian3.fromElements(x, y, z), newPositionX);

  viewer.entities.add({
    id: "moveX",
    polyline: {
      positions: [Cesium.Cartesian3.fromElements(x, y, z), newPositionX],
      width: 10,
      material: Cesium.Color.RED,
    },
  });

  var newPositionY = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  Cesium.Cartesian3.add(newPositionY, offsetVectorY, newPositionY);
  viewer.entities.add({
    id: "moveY",
    //name: "Gizmo",
    polyline: {
      positions: [Cesium.Cartesian3.fromElements(x, y, z), newPositionY],
      width: 10,
      material: Cesium.Color.BLUE,
    },
  });

  var newPositionZ = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  Cesium.Cartesian3.add(newPositionZ, offsetVectorZ, newPositionZ);
  viewer.entities.add({
    id: "moveZ",
    //name: "Gizmo",
    polyline: {
      positions: [Cesium.Cartesian3.fromElements(x, y, z), newPositionZ],
      width: 10,
      material: Cesium.Color.GREEN,
    },
  });

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
