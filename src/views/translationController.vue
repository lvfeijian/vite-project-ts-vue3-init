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
  translationController()
  rotateController()
})
function init() {
  const viewModel = {
    header: 1.35,
    pitch: 0,
    roll: 0
  }
  const position = Cesium.Cartesian3.fromDegrees(
    113.41274486612056, 23.04266533915767, 0
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
function translationController() {
  let size = 100
  let lineWidth = 5
  let ModelMatrix = entity.computeModelMatrix()
  // 获取模型位置
  let position = entity.position._value
  // 获取当前模型的旋转矩阵
  var rotationMatrix
  if (entity.orientation) {
    // 将四元数转换为3x3旋转矩阵
    // 将旋转信息从四元数形式转换为矩阵形式
    rotationMatrix = Cesium.Matrix3.fromQuaternion(entity.orientation._value)
    // rotationMatrix = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(viewModel.header, viewModel.pitch, viewModel.roll))
  } else {
    rotationMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)
  }
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
  var newPositionX = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  // 将实体位置沿着offsetVectorX方向移动size距离
  Cesium.Cartesian3.add(newPositionX, offsetVectorX, newPositionX);
  let InstancesX = new Cesium.GeometryInstance({
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
  var newPositionY = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  Cesium.Cartesian3.add(newPositionY, offsetVectorY, newPositionY);
  let InstancesY = new Cesium.GeometryInstance({
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
  var newPositionZ = entity.position
    .getValue(viewer.clock.currentTime)
    .clone();
  Cesium.Cartesian3.add(newPositionZ, offsetVectorZ, newPositionZ);
  let InstancesZ = new Cesium.GeometryInstance({
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
    geometryInstances: [InstancesX, InstancesY, InstancesZ],
    appearance: new Cesium.PolylineColorAppearance()
  })
  viewer.scene.primitives.add(primitive)

  // x轴箭头
  let Translation = Cesium.Matrix4.multiplyByTranslation(entity.computeModelMatrix(),new Cesium.Cartesian3(size, 0, 0),new Cesium.Matrix4())
  let modelMatrix = Cesium.Matrix4.multiplyByMatrix3(Translation,Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90)),new Cesium.Matrix4())
  let InstancesArrowX = new Cesium.GeometryInstance({
    geometry: new Cesium.CylinderGeometry({
      length: 10,
      topRadius: 0,
      bottomRadius: 2,
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
    },
    modelMatrix:modelMatrix
  })

  let TranslationY = Cesium.Matrix4.multiplyByTranslation(entity.computeModelMatrix(),new Cesium.Cartesian3(0, size, 0),new Cesium.Matrix4())
  let TranslationYRotateMatrix = Cesium.Matrix4.multiplyByMatrix3(TranslationY,Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(-90)),new Cesium.Matrix4())
  let InstancesArrowY = new Cesium.GeometryInstance({
    geometry: new Cesium.CylinderGeometry({
      length: 10,
      topRadius: 0,
      bottomRadius: 2,
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 1.0))
    },
    modelMatrix:TranslationYRotateMatrix
  })

  let TranslationZ = Cesium.Matrix4.multiplyByTranslation(entity.computeModelMatrix(),new Cesium.Cartesian3(0, 0, size),new Cesium.Matrix4())
  let InstancesArrowZ = new Cesium.GeometryInstance({
    geometry: new Cesium.CylinderGeometry({
      length: 10,
      topRadius: 0,
      bottomRadius: 2,
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 1.0))
    },
    modelMatrix:TranslationZ
  })

  let primitiveArrow = new Cesium.Primitive({
    geometryInstances: [InstancesArrowX, InstancesArrowY,InstancesArrowZ],
    appearance:  new Cesium.PolylineColorAppearance(),
  })
  viewer.scene.primitives.add(primitiveArrow)
}
function rotateController() {
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
  let modelMatrix = entity.computeModelMatrix()
  let axisXMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix,new Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90)), new Cesium.Matrix4())
  const instance = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
    },
    modelMatrix: axisXMatrix
  });
  let axisYMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix,new Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90)), new Cesium.Matrix4())
  const instanceY = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 1.0))
    },
    modelMatrix: axisYMatrix
  });
  const instanceZ = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.0, 1.0, 1.0))
    },
    modelMatrix: modelMatrix
  });
  let primitive = new Cesium.Primitive({
    geometryInstances: [instance, instanceY,instanceZ],
    appearance: new Cesium.PolylineColorAppearance(),
  })
  viewer.scene.primitives.add(primitive)
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
