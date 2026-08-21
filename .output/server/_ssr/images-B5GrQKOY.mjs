//#region node_modules/.nitro/vite/services/ssr/assets/images-B5GrQKOY.js
/** Scales a picture to fit `maxSide` and returns a compressed JPEG data URL. */
async function compressImage(file, maxSide = 1e3, quality = .7) {
	if (!file.type.startsWith("image/")) throw new Error("فقط فایل تصویری قابل انتخاب است.");
	const bitmap = await loadBitmap(file);
	const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("پردازش تصویر روی این دستگاه ممکن نیست.");
	ctx.drawImage(bitmap, 0, 0, width, height);
	if ("close" in bitmap) bitmap.close();
	return canvas.toDataURL("image/jpeg", quality);
}
async function loadBitmap(file) {
	if (typeof createImageBitmap === "function") try {
		return await createImageBitmap(file);
	} catch {}
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		return img;
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	}
}
//#endregion
export { compressImage as t };
