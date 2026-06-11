/* 本地图片选择 + 压缩
   手机拍照原图动辄 3-8MB，统一压缩为最长边 720px 的 JPEG（约 60-150KB）
   后以 data-URL 形式随表单入库（演示模式入 localStorage，真实模式入 MySQL MEDIUMTEXT） */

const MAX_EDGE = 720;
const QUALITY = 0.75;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'));
      return;
    }
    // imageOrientation: 'from-image' 自动按 EXIF 矫正手机照片方向
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then(bitmap => {
        const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * scale);
        const h = Math.round(bitmap.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      })
      .catch(() => {
        // 兼容旧浏览器：退回 FileReader + Image
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', QUALITY));
          };
          img.onerror = () => reject(new Error('图片读取失败'));
          img.src = reader.result;
        };
        reader.onerror = () => reject(new Error('图片读取失败'));
        reader.readAsDataURL(file);
      });
  });
}
