<template>
  <div>
    <div id="cesiumContainer"></div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch,nextTick,computed } from "vue";
import { lngLatHeightFromCartesian } from '@/lib/cesiumUtils'

// 模型初始化位置
let modelPosition = reactive({
  lng: 113.57148,
  lat: 22.76804,
  height: 0
})
// header pitch和roll的值，单位是度
const viewModel = {
  header: 0,
  pitch: 0,
  roll: -90
}
onMounted(() => {
  init()
  clickgetPosition()
})
async function init(){
  const position = Cesium.Cartesian3.fromDegrees(
    modelPosition.lng,
    modelPosition.lat,
    modelPosition.height
  );
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;

  const url = "/api/draco/无标题.glb";
  const model = viewer.scene.primitives.add(
    await Cesium.Model.fromGltfAsync({
      url: url,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll)),
      ),
    }),
  );
  window.model = model
  console.log(model.modelMatrix,'model.modelMatrix');

  const rotationMatrix = Cesium.Matrix4.fromRotationTranslation(
    Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90)) // Rotate 90 degrees around the X-axis
  );
  model.modelMatrix = Cesium.Matrix4.multiply(model.modelMatrix, rotationMatrix, new Cesium.Matrix4());
  console.log(model.modelMatrix,'model.modelMatrix');

  model.readyEvent.addEventListener(() => {
    viewer.camera.flyToBoundingSphere(model.boundingSphere, {
      duration: 0.0,
    });

  })
}
// 点击获取位置
function clickgetPosition() {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(function (movement) {

    const modelMatrix = model.modelMatrix; // 获取模型的4×4变换矩阵

    const pick = viewer.scene.pick(movement.position);
    pick.detail.node.show = false
    console.log(pick.detail.node.transform);
    var resultMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(modelMatrix,pick.detail.node.transform,resultMatrix)

    const position = new Cesium.Cartesian3();
    Cesium.Matrix4.getTranslation(resultMatrix,position)
    console.log(position,'position',lngLatHeightFromCartesian(position));

    var entity = viewer.entities.add({
      position: position,
      ellipsoid: {
          radii: new Cesium.Cartesian3(1,1,1), // 球体的半径
          material: Cesium.Color.RED.withAlpha(0.5) // 球体的颜色和透明度
      }
    });

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


}
</script>

<style scoped>

</style>
