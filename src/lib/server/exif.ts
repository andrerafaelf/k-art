// Phone photos record the GPS position they were taken at. The admin shrinks
// and re-saves photos in the browser before uploading, which drops it, but a
// JPEG that arrives untouched is cleaned here too: the GPS block in the EXIF
// is blanked, and XMP and IPTC metadata, which can repeat it, are dropped. The
// rest of the EXIF stays, so photos keep their rotation.

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
const GPS_TAG = 0x8825;

const startsWith = (bytes: Uint8Array, at: number, text: string) =>
	[...text].every((c, i) => bytes[at + i] === c.charCodeAt(0));

/** Zeroes the GPS block of an EXIF segment in place. Returns false when the EXIF can't be read. */
function blankGps(segment: Uint8Array, tiff: number): boolean {
	const view = new DataView(segment.buffer, segment.byteOffset, segment.byteLength);
	const inside = (offset: number, size: number) => offset >= 0 && tiff + offset + size <= segment.length;
	if (!inside(0, 8)) return false;
	const order = String.fromCharCode(segment[tiff], segment[tiff + 1]);
	if (order !== 'II' && order !== 'MM') return false;
	const le = order === 'II';
	const u16 = (o: number) => view.getUint16(tiff + o, le);
	const u32 = (o: number) => view.getUint32(tiff + o, le);

	const ifd0 = u32(4);
	if (!inside(ifd0, 2)) return false;
	const count = u16(ifd0);
	for (let k = 0; k < count; k++) {
		const entry = ifd0 + 2 + k * 12;
		if (!inside(entry, 12)) return false;
		if (u16(entry) !== GPS_TAG) continue;

		const gps = u32(entry + 8);
		if (!inside(gps, 2)) return false;
		const n = u16(gps);
		if (!inside(gps, 2 + n * 12)) return false;
		for (let j = 0; j < n; j++) {
			const e = gps + 2 + j * 12;
			const size = (TYPE_SIZES[u16(e + 2)] ?? 1) * u32(e + 4);
			// Values over four bytes (the coordinates) are stored elsewhere in the block
			if (size > 4) {
				const at = u32(e + 8);
				if (inside(at, size)) segment.fill(0, tiff + at, tiff + at + size);
			}
		}
		// No entries left: an empty GPS block that readers skip
		segment.fill(0, tiff + gps, tiff + gps + 2 + n * 12);
		return true;
	}
	return true;
}

/** Returns the JPEG without its location, or the same array when there was nothing to remove. */
export function stripLocation(jpeg: Uint8Array): Uint8Array {
	if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return jpeg;
	const parts: Uint8Array[] = [jpeg.subarray(0, 2)];
	let changed = false;
	let i = 2;

	while (i + 4 <= jpeg.length) {
		if (jpeg[i] !== 0xff) return jpeg;
		const marker = jpeg[i + 1];
		if (marker === 0xff) {
			i++;
			continue;
		}
		// Start of the image data: no metadata after this point
		if (marker === 0xda || marker === 0xd9) break;
		const length = (jpeg[i + 2] << 8) | jpeg[i + 3];
		const end = i + 2 + length;
		if (length < 2 || end > jpeg.length) return jpeg;
		const segment = jpeg.subarray(i, end);

		if (marker === 0xe1 && startsWith(segment, 4, 'Exif\0\0')) {
			const copy = segment.slice();
			let ok = false;
			try {
				ok = blankGps(copy, 10);
			} catch {}
			// EXIF that can't be read is dropped whole rather than risk keeping a location
			if (ok) parts.push(copy);
			if (!ok || copy.some((b, k) => b !== segment[k])) changed = true;
		} else if ((marker === 0xe1 && startsWith(segment, 4, 'http://ns.adobe.com/')) || marker === 0xed) {
			changed = true;
		} else {
			parts.push(segment);
		}
		i = end;
	}
	if (!changed) return jpeg;

	parts.push(jpeg.subarray(i));
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let at = 0;
	for (const p of parts) {
		out.set(p, at);
		at += p.length;
	}
	return out;
}
