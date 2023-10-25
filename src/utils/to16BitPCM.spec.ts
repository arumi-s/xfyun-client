import { from16BitPCM, to16BitPCM } from './to16BitPCM';

describe('to16BitPCM', () => {
	it('should convert Float32Array to 16 bit PCM formatted Uint8Array', () => {
		const input = new Float32Array([1.0, -0.5, 0, 0.5, -1.0]);
		const expected = new Uint8Array([0xff, 0x7f, 0x00, 0xc0, 0x00, 0x00, 0xff, 0x3f, 0x00, 0x80]);

		expect(to16BitPCM(input)).toStrictEqual(expected);
	});
});

describe('from16BitPCM', () => {
	it('should convert 16 bit PCM formatted Uint8Array to Float32Array', () => {
		const input = new Uint8Array([0xff, 0x7f, 0x00, 0xc0, 0x00, 0x00, 0xff, 0x3f, 0x00, 0x80]);
		const expected = new Float32Array([1.0, -0.5, 0, 0.4999847412109375, -1.0]); // the convertion is inherently imperfect.

		expect(from16BitPCM(input)).toStrictEqual(expected);
	});
});
