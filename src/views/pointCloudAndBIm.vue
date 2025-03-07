<template>
  <div>
    <div id="toolbar">
      <table>
        <tbody>
          <tr>
            <td>
              header
            </td>
            <td>
              <input type="range" min="0" max="360" step="1" data-bind="value: header, valueUpdate: 'input'">
              <input type="text" size="1" data-bind="value: header">
            </td>
          </tr>
          <tr>
            <td>
              pitch
            </td>
            <td>
              <input type="range" min="0" max="360" step="1" data-bind="value: pitch, valueUpdate: 'input'">
              <input type="text" size="1" data-bind="value: pitch">
            </td>
          </tr>

          <tr>
            <td>
              roll
            </td>
            <td>
              <input type="range" min="0" max="360" step="1" data-bind="value: roll, valueUpdate: 'input'">
              <input type="text" size="1" data-bind="value: roll">
            </td>
          </tr>
          <tr>
            <td>
              lng
            </td>
            <td>
              <input type="range" min="113.41" max="113.42" step="0.0001" data-bind="value: lng, valueUpdate: 'input'">
              <input type="text" size="1" data-bind="value: lng">
            </td>
          </tr>
          <tr>
            <td>
              lat
            </td>
            <td>
              <input type="range" min="0" max="90" step="0.1" data-bind="value: lat, valueUpdate: 'input'">
              <input type="text" size="1" data-bind="value: lat">
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <el-button @click="showPointCloud">点云</el-button>
    <el-button @click=show3dtiles>3dTiles</el-button>

    <div id="cesiumContainer" class="fullSize"></div>
    <div class="info" v-if="tableData.length">
    <el-table :data="tableData" border style="width: 100%" height="400">
      <el-table-column prop="key" label="属性">
      </el-table-column>
      <el-table-column prop="value" label="值" width="380">
      </el-table-column>
    </el-table>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from 'vue'
import propertySheet from './data.json'
import { lngLatHeightFromCartesian, MoveModelPosition, getCartesian3 } from "@/lib/cesiumUtils.js";

const tableData = ref([])
let alltileset = []
let viewModel = {
    header: 0,
    pitch: 0,
    roll: 0,
    lng:113.41281013009561,
    lat: 23.043640083542368
  }
onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;

  initHBIM()
  clickPrintlnglat()
  initPointCloud()
  // init3dTiles()

})
async function initPointCloud() {

  // const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2962043,{
  //   modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
  //     Cesium.Cartesian3.fromDegrees(0, 0),
  //   ),
  // });
  let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(113.41276055647141,23.042717673068115,0),
  )
  const tileset = await Cesium.Cesium3DTileset.fromUrl("/api/10-1/tileset.json",{
    modelMatrix
  });
  viewer.scene.primitives.add(tileset);

  const tileset2 = await Cesium.Cesium3DTileset.fromUrl("/api/10-2/tileset.json",{
    modelMatrix
  });
  viewer.scene.primitives.add(tileset2);


  const tileset3 = await Cesium.Cesium3DTileset.fromUrl("/api/10-3/tileset.json",{
    modelMatrix
  });
  viewer.scene.primitives.add(tileset3);

  const tileset4 = await Cesium.Cesium3DTileset.fromUrl("/api/10-4/tileset.json",{
    modelMatrix
  });
  viewer.scene.primitives.add(tileset4);

  const tileset5 = await Cesium.Cesium3DTileset.fromUrl("/api/10-5/tileset.json",{
    modelMatrix
  });
  viewer.scene.primitives.add(tileset5);

  // tileset.maximumScreenSpaceError = 1.0;


  //   tileset.pointCloudShading.maximumAttenuation = undefined; // Will be based on maximumScreenSpaceError instead
  //   tileset.pointCloudShading.baseResolution = undefined;
  //   tileset.pointCloudShading.geometricErrorScale = 1.0;
  //   tileset.pointCloudShading.attenuation = true;
  //   tileset.pointCloudShading.eyeDomeLighting = true;
  viewer.zoomTo(tileset)
  alltileset = [tileset,tileset2,tileset3,tileset4,tileset5]
// viewer.scene.primitives.remove(tileset)

}

// 初始化bim (渲染glb模型使用entity)
function initHBIM() {
  // 113.41274486612056 23.04266533915767
  const position = Cesium.Cartesian3.fromDegrees(
    viewModel.lng,viewModel.lat,0
  );
  // 设置entity的方向
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll))
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
  // viewer.flyTo(entity)
  viewer.zoomTo(entity)


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
    // pick.detail.node.show = false
    // pick.detail.node.runtimePrimitive[0].primitive
    // pick.primitive.material.uniforms.color=Cesium.Color.BLUE
    const name = pick?.detail?.node?._name;
    console.log(name, 'name');

    if (!name) {
      tableData.value = []
    } else {

      let id = name.replace('product-', '').replace('-body', '').toUpperCase()
      let res = propertySheet.find(obj => {
        return obj.id == id
      })
      let arr = []
      Object.keys(res).forEach(key => {
        arr.push({
          key: key,
          value: res[key]
        })
      })
      tableData.value = arr
    }
    console.log(color);
    if (color) {
      console.log(color);
      pickPrimitives.map(item => {
        item.material.metallicRoughness.baseColorFactor = color
      })
    }

    var modelPrimitives = pick.detail.model
    // var modelPrimitives = viewer.scene.primitives._primitives[1];
    pickPrimitives = modelPrimitives.getNode(name)._runtimeNode.node.primitives
    // console.log(pickPrimitives);
    pickPrimitives.map(item => {
      color = item.material.metallicRoughness.baseColorFactor
      // console.log(item.material.metallicRoughness.baseColorFactor);
      item.material.metallicRoughness.baseColorFactor = Cesium.Cartesian4.fromColor(Cesium.Color.RED);
    })

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 模型旋转
  Cesium.knockout.track(viewModel);
  let toolbar = document.getElementById("toolbar");
  Cesium.knockout.applyBindings(viewModel, toolbar);
  Cesium.knockout
    .getObservable(viewModel, "header")
    .subscribe(function (newValue) {
      console.log(newValue, 'header');

      entity.orientation._value = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(newValue), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll))
      )
    });
  Cesium.knockout
    .getObservable(viewModel, "pitch")
    .subscribe(function (newValue) {
      entity.orientation._value = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(newValue), Cesium.Math.toRadians(viewModel.roll))
      )
    });
  Cesium.knockout
    .getObservable(viewModel, "roll")
    .subscribe(function (newValue) {
      entity.orientation._value = Cesium.Transforms.headingPitchRollQuaternion(
        position,
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(newValue))
      )
    });
  Cesium.knockout
    .getObservable(viewModel, "lng")
    .subscribe(function (newValue) {
      entity.position._value = Cesium.Cartesian3.fromDegrees(
        newValue,
        viewModel.lat,
        0
      )
      // entity.orientation._value = Cesium.Transforms.headingPitchRollQuaternion(
      //   position,
      //   new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, newValue)
      // )
    });
}
function clickPrintlnglat(){
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    let position = getCartesian3(movement.position);
    console.log(position);
    console.log(lngLatHeightFromCartesian(position));
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
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
    // viewer.zoomTo(tileset);
  } catch (error) {
    console.error(`Error creating tileset: ${error}`);
  }
}
function showPointCloud(){
  window.entity.show = false
  alltileset.map(item => {
    item.show = true
  })
}
function show3dtiles(){
  window.entity.show = true
  alltileset.map(item => {
    item.show = false
  })
}
</script>

<style scoped lang="scss">
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
