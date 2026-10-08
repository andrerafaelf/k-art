// Runs in the browser before an image is uploaded. Phone photos are often
// 5 to 10 MB and carry the GPS position they were taken at; redrawing them on
// a canvas makes them a sensible size for the web and leaves all of that
// metadata behind. Rotation is applied while drawing, so nothing depends on it.

const MAX_EDGE = 2400;

const encode = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
	new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

function transparent(ctx: CanvasRenderingContext2D, w: number, h: number) {
	const { data } = ctx.getImageData(0, 0, w, h);
	for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
	return false;
}

/** A resized copy of the image without its metadata, or the original when it can't be redrawn (SVG, HEIC in some browsers). */
export async function prepare(file: File): Promise<File> {
	if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		return file;
	}
	const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) return file;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();

	// WebP keeps transparency and is small. Safari can't make WebP, so it gets
	// JPEG for photos and PNG for images with see-through parts, like logos.
	let blob = await encode(canvas, 'image/webp', 0.86);
	if (blob?.type !== 'image/webp') {
		const alpha = file.type !== 'image/jpeg' && transparent(ctx, w, h);
		blob = await encode(canvas, alpha ? 'image/png' : 'image/jpeg', 0.88);
	}
	if (!blob) return file;

	const ext = blob.type.split('/')[1].replace('jpeg', 'jpg');
	return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`, {
		type: blob.type,
		lastModified: Date.now()
	});
}
