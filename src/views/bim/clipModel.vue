<template>
  <div>
    <el-button @click="clipModel">水平裁剪</el-button>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue"
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
  roll: 0
}
onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  loadModel()
})
async function loadModel() {
  const url = "/api/draco/draco-GZ_04_0031_仲贵祖祠_模型.gltf";
  const position = Cesium.Cartesian3.fromDegrees(
    modelPosition.lng,
    modelPosition.lat,
    modelPosition.height
  );

  const model = viewer.scene.primitives.add(
    await Cesium.Model.fromGltfAsync({
      id: 'aaa',
      url: url,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll)),
      ),
      // showOutline: true,
      // silhouetteSize: 10,
      // outlineColor: new Cesium.Color(1,0,0,1),
      showCreditsOnScreen: true,
      projectTo2D: true
    }),
  );
  window.model = model
  let removeListener = model.readyEvent.addEventListener(() => {
    viewer.camera.flyToBoundingSphere(model.boundingSphere, {
      duration: 0.0,
    });

    removeListener()
  })
}
let clippingPlanes;
let selectedPlane;
let targetY = 0.0;

function clipModel() {
  const scene = viewer.scene
  const downHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  downHandler.setInputAction(function (movement) {
    const pickedObject = scene.pick(movement.position);
    console.log(pickedObject);
    if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.id) &&
      Cesium.defined(pickedObject.id.plane)
    ) {
      selectedPlane = pickedObject.id.plane;
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.05);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      // 禁止鼠标拖动修改相机位置和方向
      scene.screenSpaceCameraController.enableInputs = false;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Release plane on mouse up
  const upHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  upHandler.setInputAction(function () {
    if (Cesium.defined(selectedPlane)) {
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.1);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      selectedPlane = undefined;
    }

    scene.screenSpaceCameraController.enableInputs = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  // Update plane on mouse move
  const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  moveHandler.setInputAction(function (movement) {
    if (Cesium.defined(selectedPlane)) {
      const deltaY = movement.startPosition.y - movement.endPosition.y;
      targetY += deltaY;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


  clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: [
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0),
    ],
    edgeWidth: 1.0,
    unionClippingRegions: false
  });
  model.clippingPlanes = clippingPlanes

  if (!Cesium.Matrix4.equals(model.modelMatrix, Cesium.Matrix4.IDENTITY)) {
      // 裁剪面初始化位置是model.modelMatrix
      // The clipping plane is initially positioned at the tileset's root transform.
      // Apply an additional matrix to center the clipping plane on the bounding sphere center.
      const transformCenter = Cesium.Matrix4.getTranslation(
        model.modelMatrix,
        new Cesium.Cartesian3(),
      );
      const transformCartographic =
        Cesium.Cartographic.fromCartesian(transformCenter);
        console.log(transformCartographic,'transformCartographic');

      const boundingSphereCartographic = Cesium.Cartographic.fromCartesian(
        model.boundingSphere.center,
      );
      console.log(boundingSphereCartographic , transformCartographic);

      const height =
        boundingSphereCartographic.height - transformCartographic.height;
      clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(
        new Cesium.Cartesian3(0.0, 0.0, height),
      );

    }
  const boundingSphere = model.boundingSphere;
  const radius = boundingSphere.radius;
  for (let i = 0; i < clippingPlanes.length; ++i) {
    const plane = clippingPlanes.get(i);
    const planeEntity = viewer.entities.add({
      position: boundingSphere.center,
      plane: {
        dimensions: new Cesium.Cartesian2(radius * 2.5, radius * 2.5),
        material: Cesium.Color.WHITE.withAlpha(0.1),
        plane: new Cesium.CallbackProperty(
          createPlaneUpdateFunction(plane),
          false,
        ),
        outline: true,
        outlineColor: Cesium.Color.WHITE,
      },
    });
  }
}
function createPlaneUpdateFunction(plane) {
  return function () {
    plane.distance = targetY;
    return plane;
  };
}
</script>

<style scoped></style>
