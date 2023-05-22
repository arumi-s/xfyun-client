import { resample } from './resample';

describe('resample', () => {
	it('should resample data to new sample rate', () => {
		expect(resample(new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]), 2, 1)).toStrictEqual(new Float32Array([0, 2, 4, 6, 8]));
	});

	it('should interpolate nonexisting intermediate values', () => {
		expect(resample(new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 1)).toStrictEqual(new Float32Array([0, 2.25, 4.5, 6.75, 9]));
	});

	it('should keep the first and last values', () => {
		const resampled = resample(new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), 2, 10);
		expect(resampled[0]).toStrictEqual(0);
		expect(resampled[resampled.length - 1]).toStrictEqual(9);
	});
});
