/**
 * 3d笛卡尔坐标转经纬度高程
 * @param {3d笛卡尔坐标} cartesian
 * @returns 经纬度高程对象
 */
export function lngLatHeightFromCartesian(cartesian) {
  let cartographic = new Cesium.Cartographic();
  CartographicFromCartesian(cartesian, cartographic);
  // 弧度转为度数(经纬度)
  let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
  let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
  let alt = cartographic.height; // 高度
  return { lng, lat, alt };
}
/**
 * 移动模型的位置
 * @param {number} offsetx
 * @param {number} offsety
 * @param {number} offsetz
 * @param {object} tileset
 */
export function MoveModelPosition(offsetx, offsety, offsetz, tileset) {
  const tempTranslation = new Cesium.Cartesian3(offsetx, offsety, offsetz);
  const surface = tileset.boundingSphere.center;
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(surface);
  const offset = Cesium.Matrix4.multiplyByPoint(m, tempTranslation, new Cesium.Cartesian3(0, 0, 0));
  const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}
/**
 * 3d笛卡尔坐标转弧度
 * @param {3d笛卡尔坐标} cartesian
 * @param {返回值 对象中的值将以弧度表示} result
 */
function CartographicFromCartesian(cartesian, result) {
  Cesium.Cartographic.fromCartesian(cartesian, Cesium.Ellipsoid.WGS84, result);
}
// 获取3d笛卡尔坐标
export function getCartesian3(movement) {
  let position;
  let earthPosition;
  let scene = viewer.scene;
  const pickedObject = scene.pick(movement); //判断是否拾取到模型
  if (Cesium.defined(pickedObject)) {
    // 获取空间坐标
    let cartesian = scene.pickPosition(movement); // 返回从深度缓冲区和窗口位置重建的笛卡尔位置。
    if (Cesium.defined(cartesian)) {
      position = cartesian;
    } else {
      const pickedObjects = scene.drillPick(movement);
      // 获取最上层的entity的点的坐标
      position = pickedObjects[0].primitive._position;
      if (!position) {
        earthPosition = viewer.camera.pickEllipsoid(
          movement,
          viewer.scene.globe.ellipsoid,
          earthPosition
        ); //返回在椭球上面的点的坐标
        if (Cesium.defined(earthPosition)) {
          position = earthPosition;
        }
      }
    }
  } else {
    // 在椭球下点击创建点
    earthPosition = viewer.camera.pickEllipsoid(
      movement,
      viewer.scene.globe.ellipsoid,
      earthPosition
    ); //返回在椭球上面的点的坐标
    if (Cesium.defined(earthPosition)) {
      position = earthPosition;
    }
  }
  return position;
}
