export const to16BitPCM = (input: Float32Array): Uint8Array => {
	const dataLength = input.length * (16 / 8);
	const dataBuffer = new ArrayBuffer(dataLength);
	const dataView = new DataView(dataBuffer);
	let offset = 0;
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
	return new Uint8Array(dataView.buffer);
};
