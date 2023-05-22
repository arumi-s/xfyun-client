const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const toBase64 = (input: Uint8Array): string => {
	const length = input.length;

	// Convert
	const base64Chars = [];
	for (let i = 0; i < length; i += 3) {
		const triplet = (input[i] << 16) | (input[i + 1] << 8) | input[i + 2];

		for (let j = 0; j < 4 && i + j * 0.75 < length; j++) {
			base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
		}
	}

	// Add padding
	const paddingChar = map.charAt(64);
	while (base64Chars.length % 4) {
		base64Chars.push(paddingChar);
	}

	return base64Chars.join('');
};
