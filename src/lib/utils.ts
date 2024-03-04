// 参考：https://cn.vitejs.dev/guide/assets.html
export function getImageUrl(name: string) {
  return new URL(`/src/assets/image/${name}`, import.meta.url).href;
}

export function _isMobile() {
  let flag = navigator.userAgent.match(
    /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i
  );
  return flag;
}
