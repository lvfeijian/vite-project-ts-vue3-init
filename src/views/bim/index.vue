<template>
  <div>
    <el-button @click="translationAndRotate">模型移动和旋转</el-button>
    <div v-if="isMove" class="move">
      <el-button @click="GenerateXYZ">添加/更新bim空间直角坐标系</el-button>
      <!-- <el-button @click="rotateController">添加/更新bim旋转球</el-button> -->
      <div class="translation">
        <div class="box">
          <div>模型移动:(单位：米 m)</div>
          <el-input v-model.number="translateValue" style="width: 200px;" />
          <div class="btns">
            <div>
              <div><el-button @click="doMove('x')">+X</el-button></div>
              <div><el-button @click="doMove('y')">+Y</el-button></div>
              <div><el-button @click="doMove('z')">+Z</el-button></div>
            </div>
            <div>
              <div><el-button @click="doMove('x', 'decrement')">-X</el-button></div>
              <div><el-button @click="doMove('y', 'decrement')">-Y</el-button></div>
              <div><el-button @click="doMove('z', 'decrement')">-Z</el-button></div>
            </div>
          </div>
        </div>
        <div class="box">
          <div>模型旋转角度:(单位:度 °)</div>
          <el-input v-model.number="rotateValue" style="width: 200px;" />
          <div class="btns">
            <div>
              <div><el-button @click="doRotate('header')">+X</el-button></div>
              <div><el-button @click="doRotate('pitch')">+Y</el-button></div>
              <div><el-button @click="doRotate('roll')">+Z</el-button></div>
            </div>
            <div>
              <div><el-button @click="doRotate('header', 'decrement')">-X</el-button></div>
              <div><el-button @click="doRotate('pitch', 'decrement')">-Y</el-button></div>
              <div><el-button @click="doRotate('roll', 'decrement')">-Z</el-button></div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div>模型位置:</div>
        <div>经度：<el-input v-model="modelPosition.lng" style="width: 200px;" /></div>
        <div>纬度：<el-input v-model="modelPosition.lat" style="width: 200px;" /></div>
        <div>高程：<el-input v-model="modelPosition.height" style="width: 200px;" /></div>
      </div>

      <el-button @click="close">关闭</el-button>
    </div>
    <div class="tree scroll-style" ref="scrollRef">
      <div class="tree-item" v-for="item in nodes" @click="onClick(item)" @dblclick="doubleClick(item)"
        :class="item.name == chooseNode ? 'active' : ''">{{ item.name }}</div>
      <!-- <el-checkbox :class="chooseNode == item.name ? 'active': ''" v-model="item.show" @change="onChange(item,$event)" :label="item.name" :value="item.name" /> -->
      <!-- .replace('product-','').replace('-body','') -->
    </div>
    <div class="info">
      <el-table :data="tableData" border style="width: 100%" max-height="400">
        <el-table-column prop="key" label="属性">
        </el-table-column>
        <el-table-column prop="value" label="值" width="380">
        </el-table-column>
      </el-table>
      <div>是否可见
        <el-switch v-model="chooseDisplay" />
      </div>
    </div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch, nextTick, computed } from "vue";
import { ElMessage } from 'element-plus'
import { lngLatHeightFromCartesian } from '@/lib/cesiumUtils'
import propertySheet from '../data.json'

const tableData = ref([])
// 模型初始化位置
let modelPosition = reactive({
  lng: 113.57148,
  lat: 22.76804,
  height: 0
})
watch(modelPosition, () => {
  rotateGltf()
})
// header pitch和roll的值，单位是度
const viewModel = {
  header: 0,
  pitch: 0,
  roll: 0
}
const nodes = ref([])
let isMove = ref(false)
let translateValue = ref()
let rotateValue = ref<number>()
const scrollRef = ref(null)
onMounted(() => {
  init()
  clickHide()
})
async function init() {
  const position = Cesium.Cartesian3.fromDegrees(
    modelPosition.lng,
    modelPosition.lat,
    modelPosition.height
  );

  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll))
  )
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
      url: "https://t0.tianditu.gov.cn/img_w/wmts?tk=c4e3a9d54b4a79e885fff9da0fca712a&service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
      maximumLevel: 18
    })
  )
  window.viewer = viewer;
  viewer.scene.debugShowFramesPerSecond = true;
  const url = "/api/draco/无标题.glb";
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
      projectTo2D: true,
    }),
  );
  window.model = model
  let removeListener = model.readyEvent.addEventListener(() => {
    showMeshTree()
    viewer.camera.flyToBoundingSphere(model.boundingSphere, {
      duration: 0.0,
    });

    removeListener()
  })

  // const entity = viewer.entities.add({
  //   id: 'aaa',
  //   name: url,
  //   position: position,
  //   orientation: orientation,
  //   model: {
  //     uri: url,
  //     // color: new Cesium.Color(1, 0, 0, 1)
  //   },
  // });
  // window.entity = entity
  // // viewer.trackedEntity = entity;
  // viewer.flyTo(entity)



}
const chooseNode = ref('')
const chooseDisplay = computed({
  get() {
    let isShow
    nodes.value.forEach(node => {
      if (node.name == chooseNode.value) {
        isShow = node.show
        return
      }
    });
    return isShow
  },
  set(value) {
    nodes.value.forEach(node => {
      if (node.name == chooseNode.value) {
        node.show = value
        model._nodesByName[node.name].show = value
        return
      }
    });
  }

})
let color = null
let pickPrimitives
// 点击隐藏
function clickHide() {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(function (movement) {

    const modelMatrix = model.modelMatrix; // 获取模型的4×4变换矩阵

    const pick = viewer.scene.pick(movement.position);
    console.log(pick, 'pick');
    // highlightComponent(pick.detail.node._id)
    // pick.detail.node.show = false
    // console.log(pick.detail.node.transform);
    // 第一种办法
    // ============
    // 构造旋转矩阵
    var rotationMatrix = new Cesium.Matrix4(
      0, 0, 1, 0,
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 0, 1
    );
    // pick.detail.node.transform是gltf坐标系，将gltf坐标系（y-up）转成cesium（z-up）坐标系
    let yUpCatrix4 = Cesium.Matrix4.multiplyTransformation(rotationMatrix, pick.detail.node.transform, new Cesium.Matrix4())
    // console.log(yUpCatrix4,'yUpCatrix4');

    var resultMatrix = new Cesium.Matrix4();

    Cesium.Matrix4.multiply(modelMatrix, yUpCatrix4, resultMatrix)
    // // 将 3x3 旋转矩阵转换为 4x4 矩阵
    // var rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3);
    // // 将旋转矩阵与原始矩阵相乘
    // var res = Cesium.Matrix4.multiply(rotationMatrix4, pick.detail.node.transform, new Cesium.Matrix4());
    // console.log(res, '---------------');
    // ==================
    // 第二种办法
    // +++++++++++++++++++++++
    // var resultMatrix = new Cesium.Matrix4();
    // // 创建变换矩阵
    // var transformationMatrix = new Cesium.Matrix3(
    //     0, 0, 1,
    //     1, 0, 0,
    //     0, 1, 0
    // );

    // // 应用变换矩阵到点 A
    // var pointB = Cesium.Matrix3.multiplyByVector(transformationMatrix, pick.detail.node.translation, new Cesium.Cartesian3());
    // // pick.detail.node.translation = pointB
    // console.log(pick.detail.node);
    // Cesium.Matrix4.multiplyByTranslation(modelMatrix, pointB, resultMatrix); //pick.detail.node.translation
    // +++++++++++++++++++++++++
    const position = new Cesium.Cartesian3();
    Cesium.Matrix4.getTranslation(resultMatrix, position)

    var entity = viewer.entities.add({
      position: position,
      ellipsoid: {
        radii: new Cesium.Cartesian3(1, 1, 1), // 球体的半径
        material: Cesium.Color.RED.withAlpha(0.5) // 球体的颜色和透明度
      }
    });
    // pick.detail.node.translation = new Cesium.Cartesian3(0,0,0)
    // var resultMatrix = new Cesium.Matrix4();
    // Cesium.Matrix4.fromTranslationQuaternionRotationScale(pick.detail.node.translation,pick.detail.node.rotation,pick.detail.node.scale,resultMatrix)
    // console.log(resultMatrix,'resultMatrix');

    // pick.detail.node._transform = new Cesium.Cartesian3(0,0,0)

    //  // 获取当前模型的旋转矩阵
    // var rotationMatrix = new Cesium.Matrix3()
    // var resultMatrix = new Cesium.Matrix4();
    // const position2 = new Cesium.Cartesian3();
    // const modelMatrix = model.modelMatrix; // 获取模型的4×4变换矩阵
    // Cesium.Matrix4.multiply(modelMatrix, pick.detail.node._originalTransform, resultMatrix);
    // console.log(resultMatrix,'resultMatrix');
    // Cesium.Matrix4.getTranslation(resultMatrix,position2)
    // console.log(position2,'position',lngLatHeightFromCartesian(position2));
    // Cesium.Matrix4.getRotation(resultMatrix,rotationMatrix)
    // console.log(rotationMatrix,'rotationMatrix');


    // console.log(pick,pick.detail.node._name,pick.detail.primitive.node.translation);
    // 点击上次点击的，去将左侧列表滚动出来
    if (pick.detail.node._name == chooseNode.value) {
      let index = nodes.value.findIndex((node) => {
        return node.name == pick.detail.node._name
      })
      nextTick(() => {
        scrollRef.value.scrollTop = index * 24
      })
    }
    chooseNode.value = pick.detail.node._name
    // nodes.value.map(item => {
    //   if(item.id == pick.detail.node._id){
    //     item.show = false
    //   }
    // })




    //隐藏构件
    // pick.detail.node.show = false

    // pick.detail.node.runtimePrimitive[0].primitive
    // pick.primitive.material.uniforms.color=Cesium.Color.BLUE
    const name = pick?.detail?.node?._name;
    if (!name) {
      tableData.value = []
    } else {
      let id = name.replace('product-', '').replace('-body', '').toUpperCase()
      let res = propertySheet.find(obj => {
        return obj.id == id
      })
      if (res) {
        let arr = []
        Object.keys(res).forEach(key => {
          arr.push({
            key: key,
            value: res[key]
          })
        })
        tableData.value = arr
      } else {
        tableData.value = []
      }


    }
    if (color) {
      pickPrimitives.map(item => {
        item.material.metallicRoughness.baseColorFactor = color
      })
    }

    var modelPrimitives = pick.detail.model
    // var modelPrimitives = viewer.scene.primitives._primitives[1];
    pickPrimitives = modelPrimitives.getNode(name)._runtimeNode.node.primitives
    pickPrimitives.map(item => {
      // console.log(item);

      color = item.material.metallicRoughness.baseColorFactor
      item.material.metallicRoughness.baseColorFactor = Cesium.Cartesian4.fromColor(new Cesium.Color.fromCssColorString("#409eff"));
      // item.material.metallicRoughness.metallicFactor = 1
    })

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // handler.setInputAction(function (movement) {
  //   const pick = viewer.scene.pick(movement.position);
  //   const node = pick.detail.node;

  //   // 获取构件的位置
  //   let position = new Cesium.Cartesian3(0, 0, 0);
  //   let modelMatrix = model._nodesByName['product-0a9aa536-8685-1b4a-9212-ef41be45e95e-body'].matrix
  //   console.log(modelMatrix);

  //   Cesium.Matrix4.getTranslation(modelMatrix, position);
  //   console.log(lngLatHeightFromCartesian(position),'position');

  //   // 飞到该位置
  //   viewer.camera.flyTo({
  //     destination: position,
  //     orientation: {
  //       heading: Cesium.Math.toRadians(0),
  //       pitch: Cesium.Math.toRadians(-90),
  //       roll: Cesium.Math.toRadians(0)
  //     },
  //     duration: 2.0
  //   });
  // }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
// 后期处理高亮功能
function highlightComponent(componentId) {
  // 自定义后处理阶段
  const fragmentShaderSource = `
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
  const int KERNEL_WIDTH = 16;
  void main(void)
  {
      vec2 step = czm_pixelRatio / czm_viewport.zw;
      vec2 integralPos = v_textureCoordinates - mod(v_textureCoordinates, 8.0 * step);
      vec3 averageValue = vec3(0.0);
      for (int i = 0; i < KERNEL_WIDTH; i++)
      {
          for (int j = 0; j < KERNEL_WIDTH; j++)
          {
              averageValue += texture(colorTexture, integralPos + step * vec2(i, j)).rgb;
          }
      }
      averageValue /= float(KERNEL_WIDTH * KERNEL_WIDTH);
      out_FragColor = vec4(averageValue, 1.0);
  }
  `;
  viewer.scene.postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: fragmentShaderSource,
    }),
  );
}
function showMeshTree() {
  // viewer.entities.getById('aaa')._nodesByName
  nodes.value = Object.values(model._nodesByName).map(value => {
    return {
      id: value.id,
      name: value.name,
      show: value.show
    }
  })

  // viewer.scene.primitives._primitives.map(primitive => {
  //   // console.log(primitive.getGeometryInstanceAttributes('aaa'), 'primitive');
  //   console.log(primitive , 'primitive');

  //   // if(primitive?.id._id == 'aaa'){
  //   //   console.log(primitive._nodesByName, 'primitive._nodesByName');

  //   //   nodes.value = primitive._nodesByName
  //   // }
  // })

}
// 左侧单击事件
function onClick(node) {
  chooseNode.value = node.name
  if (color) {
    pickPrimitives.map(item => {
      item.material.metallicRoughness.baseColorFactor = color
    })
  }
  pickPrimitives = model._nodesByName[node.name]._runtimeNode.node.primitives
  pickPrimitives.map(item => {
    color = item.material.metallicRoughness.baseColorFactor
    item.material.metallicRoughness.baseColorFactor = Cesium.Cartesian4.fromColor(new Cesium.Color.fromCssColorString("#409eff"));
    // item.material.metallicRoughness.metallicFactor = 1
  })
  // model._nodesByName[node.name].show = node.show
}
//双击事件 移动视角到双击的物体
function doubleClick(node) {
  // 获取当前模型的旋转矩阵
  var rotationMatrix = new Cesium.Matrix3()
  var resultMatrix = new Cesium.Matrix4();
  const position = new Cesium.Cartesian3();
  const modelMatrix = model.modelMatrix; // 获取模型的4×4变换矩阵
  Cesium.Matrix4.multiply(modelMatrix, model._nodesByName[node.name].matrix, resultMatrix);
  console.log(resultMatrix, 'resultMatrix');
  Cesium.Matrix4.getTranslation(resultMatrix, position)
  console.log(position, 'position', lngLatHeightFromCartesian(position));
  Cesium.Matrix4.getRotation(resultMatrix, rotationMatrix)
  console.log(rotationMatrix, 'rotationMatrix');
  // 将旋转矩阵转换为四元数
  var quaternion = Cesium.Quaternion.fromRotationMatrix(rotationMatrix, new Cesium.Quaternion());

  // 从四元数中提取航向角、俯仰角和翻滚角
  var headingPitchRoll = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);

  console.log('Heading:', Cesium.Math.toDegrees(headingPitchRoll.heading)); // 航向角
  console.log('Pitch:', Cesium.Math.toDegrees(headingPitchRoll.pitch));   // 俯仰角
  console.log('Roll:', Cesium.Math.toDegrees(headingPitchRoll.roll));    // 翻滚角
  let lnglat = lngLatHeightFromCartesian(position)
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lnglat.lng, lnglat.lat, lnglat.alt + 50),
    // orientation:  {
    //     heading : headingPitchRoll.heading,
    //     pitch : headingPitchRoll.pitch,
    //     roll : headingPitchRoll.roll
    // }
  });
  //   const modelMatrix = model.modelMatrix; // 获取模型的4×4变换矩阵
  //   console.log(modelMatrix,model._nodesByName[node.name]);

  //   // 创建一个矩阵用于存储结果
  //   const resultMatrix = new Cesium.Matrix4();
  //   // Cesium.Matrix4.multiply(modelMatrix,model._nodesByName[node.name].matrix,resultMatrix)

  //   const position = new Cesium.Cartesian3(); // 创建一个向量用于存储位置信息
  //   // 从模型矩阵中提取位置信息
  //   Cesium.Matrix4.getTranslation(model._nodesByName[node.name].matrix, position);
  //   // console.log(position, 'position');

  //   let pos = Cesium.Matrix4.multiplyByPoint(modelMatrix,position,new Cesium.Cartesian3())
  //   console.log(pos, 'pos');

  //   var cartographic = Cesium.Cartographic.fromCartesian(pos);
  // var longitude = Cesium.Math.toDegrees(cartographic.longitude);
  // var latitude = Cesium.Math.toDegrees(cartographic.latitude);
  // var height = cartographic.height;
  //   console.log(longitude, latitude, height);

  //   // console.log(lngLatHeightFromCartesian(pos),'lngLatHeightFromCartesian(pos)');
  //   let lnglat = lngLatHeightFromCartesian(pos)
  //   viewer.camera.flyTo({
  //     destination:  Cesium.Cartesian3.fromDegrees(lnglat.lng,lnglat.lat,lnglat.alt + 10)
  //   });
  //   var entity = viewer.entities.add({
  //     position: pos,
  //     ellipsoid: {
  //         radii: new Cesium.Cartesian3(1,1,1), // 球体的半径
  //         material: Cesium.Color.RED.withAlpha(0.5) // 球体的颜色和透明度
  //     }
  //   });
}
// 开始模型移动和旋转
function translationAndRotate() {
  isMove.value = !isMove.value
}
// 模型生成xyz轴
function GenerateXYZ() {
  destroy()
  let size = 100
  let lineWidth = 5
  // let ModelMatrix = entity.computeModelMatrix()

  // 获取模型位置
  let position = new Cesium.Cartesian3(0, 0, 0);
  Cesium.Matrix4.getTranslation(model.modelMatrix, position)

  // 获取当前模型的旋转矩阵
  var rotationMatrix = new Cesium.Matrix3()
  Cesium.Matrix4.getRotation(model.modelMatrix, rotationMatrix)
  console.log(rotationMatrix, 'rotationMatrix');
  // Cesium.Matrix4.fromRotation(rotationMatrix,rotationMatrix)
  // if (model.modelMatrix) {
  //   // 将四元数转换为3x3旋转矩阵
  //   // 将旋转信息从四元数形式转换为矩阵形式
  //   rotationMatrix = Cesium.Matrix3.fromQuaternion(Cesium.Transforms.eastNorthUpToFixedFrame(position))
  //   // rotationMatrix = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, viewModel.roll))
  // } else {
  //   rotationMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)
  // }

  var offsetVectorX = new Cesium.Cartesian3(size, 0, 0);
  var offsetVectorY = new Cesium.Cartesian3(0, size, 0);
  var offsetVectorZ = new Cesium.Cartesian3(0, 0, size);
  // 将向量offsetVectorX旋转
  // 使用旋转矩阵旋转向量
  offsetVectorX = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorX,
    offsetVectorX
  );
  var newPositionX = position.clone()
  // 将实体位置沿着offsetVectorX方向移动size距离
  Cesium.Cartesian3.add(newPositionX, offsetVectorX, newPositionX);
  let InstancesX = new Cesium.GeometryInstance({
    id: 'xAxis',
    geometry: new Cesium.PolylineGeometry({
      positions: [
        position, newPositionX,
      ],
      width: lineWidth,
      // vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
    },
  })
  offsetVectorY = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorY,
    offsetVectorY
  );
  var newPositionY = position.clone()
  Cesium.Cartesian3.add(newPositionY, offsetVectorY, newPositionY);
  let InstancesY = new Cesium.GeometryInstance({
    id: 'yAxis',
    geometry: new Cesium.PolylineGeometry({
      positions: [
        position, newPositionY,
      ],
      width: lineWidth,
      // vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT

    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 1.0))
    }
  })

  offsetVectorZ = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVectorZ,
    offsetVectorZ
  );
  var newPositionZ = position.clone()
  Cesium.Cartesian3.add(newPositionZ, offsetVectorZ, newPositionZ);
  let InstancesZ = new Cesium.GeometryInstance({
    id: 'zAxis',
    geometry: new Cesium.PolylineGeometry({
      positions: [
        position, newPositionZ,
      ],
      width: lineWidth,
      // vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)
    }
  })

  let primitive = new Cesium.Primitive({
    // debugShowBoundingVolume: true,
    geometryInstances: [InstancesX, InstancesY, InstancesZ],
    appearance: new Cesium.PolylineColorAppearance()
  })
  console.log(primitive.boundingSphere);

  viewer.scene.primitives.add(primitive)
}
function close() {
  isMove.value = false
  destroy()
}
// 销毁模型的xyz轴
function destroy() {
  viewer.scene.primitives._primitives.map(primitive => {
    if (primitive?._instanceIds?.includes('xAxis')) {
      primitive.destroy()
    }
  })
}
function doMove(axis, symbol = 'increment') {
  if (!translateValue.value) {
    ElMessage.warning('请先输入移动距离');
    return
  }
  let move
  // 获取当前模型的旋转矩阵
  var rotationMatrix
  // 获取模型位置
  let position = new Cesium.Cartesian3(0, 0, 0);
  Cesium.Matrix4.getTranslation(model.modelMatrix, position)
  // 获取当前模型的旋转矩阵
  var rotationMatrix = new Cesium.Matrix3()
  Cesium.Matrix4.getRotation(model.modelMatrix, rotationMatrix)
  // if (entity.orientation) {
  //   // 将四元数转换为3x3旋转矩阵
  //   // 将旋转信息从四元数形式转换为矩阵形式
  //   rotationMatrix = Cesium.Matrix3.fromQuaternion(entity.orientation._value)
  //   // rotationMatrix = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, viewModel.roll))
  // } else {
  //   rotationMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)
  // }
  if (symbol == 'increment') {
    move = translateValue.value
  } else if (symbol == 'decrement') {
    move = -translateValue.value
  }
  if (axis == 'x') {
    var offsetVector = new Cesium.Cartesian3(move, 0, 0);
  } else if (axis == 'y') {
    var offsetVector = new Cesium.Cartesian3(0, move, 0);
  } else if (axis == 'z') {
    var offsetVector = new Cesium.Cartesian3(0, 0, move);
  }
  // 将向量offsetVector旋转
  // 使用旋转矩阵旋转向量
  offsetVector = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    offsetVector,
    offsetVector
  );
  var newPositionX = position.clone()
  // 将实体位置沿着offsetVectorX方向移动size距离
  Cesium.Cartesian3.add(newPositionX, offsetVector, newPositionX);
  model.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(newPositionX)
  // entity.position._value = newPositionX
  let lnglatalt = lngLatHeightFromCartesian(newPositionX)
  modelPosition.lng = lnglatalt.lng
  modelPosition.lat = lnglatalt.lat
  modelPosition.height = lnglatalt.alt

}
function doRotate(orientation, symbol = 'increment') {
  if (!rotateValue.value) {
    ElMessage.warning('请先输入旋转角度');
    return
  }
  if (symbol == 'increment') {
    viewModel[orientation] += rotateValue.value
  } else if (symbol == 'decrement') {
    viewModel[orientation] -= rotateValue.value
  }
  console.log(viewModel);

  rotateGltf()
}
// 更新模型旋转
function rotateGltf() {
  const position = Cesium.Cartesian3.fromDegrees(
    modelPosition.lng,
    modelPosition.lat,
    modelPosition.height
  );

  // entity.orientation._value = Cesium.Transforms.headingPitchRollQuaternion(
  //   position,
  //   new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll))
  // )
  model.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    position,
    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(viewModel.header), Cesium.Math.toRadians(viewModel.pitch), Cesium.Math.toRadians(viewModel.roll)),
  )
}
let rotatePrimitive
function rotateController() {
  if (rotatePrimitive && rotatePrimitive.isDestroyed() == false) {
    rotatePrimitive.destroy()
  }
  let position = []
  let radius = 50
  for (let i = 0; i <= 360; i += 3) {
    const sin = Math.sin(Cesium.Math.toRadians(i));
    const cos = Math.cos(Cesium.Math.toRadians(i));
    const x = radius * cos;
    const y = radius * sin;
    position.push(new Cesium.Cartesian3(x, y, 0));
  }
  const geometry = new Cesium.PolylineGeometry({
    positions: position,
    width: 10
  });
  let modelMatrix = model.modelMatrix
  let axisXMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, new Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90)), new Cesium.Matrix4())
  const instance = new Cesium.GeometryInstance({
    id: 'xRotateAxis',
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
    },
    modelMatrix: axisXMatrix
  });
  let axisYMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, new Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90)), new Cesium.Matrix4())
  const instanceY = new Cesium.GeometryInstance({
    id: 'yRotateAxis',
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 1.0))
    },
    modelMatrix: axisYMatrix
  });
  const instanceZ = new Cesium.GeometryInstance({
    id: 'zRotateAxis',
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 1.0))
    },
    modelMatrix: modelMatrix
  });
  rotatePrimitive = new Cesium.Primitive({
    geometryInstances: [instance, instanceY, instanceZ],
    appearance: new Cesium.PolylineColorAppearance(),
  })
  viewer.scene.primitives.add(rotatePrimitive)
}
</script>

<style scoped lang="scss">
$H: 32px;

.move {
  position: fixed;
  width: 450px;
  z-index: 110;
  background: #fbf4ec;
  line-height: 36px;

  .translation {
    display: flex;
    justify-content: space-evenly;

    .box {
      width: 200px;
      // border: 1px solid #ccc;
    }
  }

  .btns {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;

    .el-button {
      margin: 5px 0;
      width: 90px;
    }

  }
}

.tree {
  position: fixed;
  width: 400px;
  height: calc(100vh - $H);
  overflow-y: scroll;
  z-index: 100;
  background: #464646;
  color: #fff;
  line-height: 22px;
  font-size: 14px;
  cursor: pointer;

  &-item {
    padding-left: 20px;
    height: 24px;
    line-height: 24px;
    user-select: none;

    &:hover {
      background: #666666;
    }

    &.active {
      background: #409eff;
    }
  }

}

:deep(.el-checkbox) {
  &.is-checked {
    .el-checkbox__label {
      color: #000 !important;
    }
  }
}

.info {
  width: 600px;
  // height: 400px;
  background: #fff;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;

  .item {
    height: 30px;
    line-height: 30px;
  }
}

#cesiumContainer {
  width: 100vw;
  height: calc(100vh - $H);
}

.scroll-style {
  &::-webkit-scrollbar-track-piece {
    background-color: #3a3a3a;
  }

  &::-webkit-scrollbar {
    width: 6px !important;
    transition: all 2s;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dddddd;
    border-radius: 100px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #bbb;
  }

  &::-webkit-scrollbar-corner {
    background-color: rgba(255, 255, 255, 0);
  }
}
</style>
