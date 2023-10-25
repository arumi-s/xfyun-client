export const resample = (sourceBuffer: Float32Array, sampleRate: number, newSampleRate: number): Float32Array => {
	const data = new Float32Array(sourceBuffer);
	const fitCount = Math.round(data.length * (newSampleRate / sampleRate));
	const buffer = new Float32Array(fitCount);
	const springFactor = (data.length - 1) / (fitCount - 1);
	buffer[0] = data[0];
	for (let i = 1; i < fitCount - 1; i++) {
		const tmp = i * springFactor;
		const before = Math.floor(tmp);
		const after = Math.ceil(tmp);
		const atPoint = tmp - before;
		buffer[i] = data[before] + (data[after] - data[before]) * atPoint;
	}
	buffer[fitCount - 1] = data[data.length - 1];
	return buffer;
};
