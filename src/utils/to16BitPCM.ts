export const to16BitPCM = (input: Float32Array): Uint8Array => {
	const dataLength = input.length * 2;
	const dataBuffer = new ArrayBuffer(dataLength);
	const dataView = new DataView(dataBuffer);
	let offset = 0;
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
	return new Uint8Array(dataView.buffer);
};

export const from16BitPCM = (input: Uint8Array): Float32Array => {
	const inputView = new DataView(input.buffer);
	const dataLength = input.length * 2;
	const dataBuffer = new ArrayBuffer(dataLength);
	const dataView = new DataView(dataBuffer);
	let offset = 0;
	for (let i = 0; i < input.length; i += 2, offset += 4) {
		const s = inputView.getInt16(i, true);
		dataView.setFloat32(offset, s < 0 ? s / 0x8000 : s / 0x7fff, true);
	}
	return new Float32Array(dataView.buffer);
};
