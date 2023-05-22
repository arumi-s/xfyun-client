import { Observable, switchMap, from, concat, defer, of } from 'rxjs';

const splitInChunksWithRemainder = (remainder: Uint8Array, maxValueSize: number) => {
	return (streamRecord: Uint8Array) => {
		const totalLength = remainder.length + streamRecord.length;
		const streamRecordWithRemainder = new Uint8Array(totalLength);
		streamRecordWithRemainder.set(remainder, 0);
		streamRecordWithRemainder.set(streamRecord, remainder.length);

		let offset = 0;
		const chunks: Uint8Array[] = [];
		let newRemainder = new Uint8Array();
		for (; offset < totalLength; offset += maxValueSize) {
			const chuckLength = totalLength - offset;
			if (chuckLength >= maxValueSize) {
				chunks.push(streamRecordWithRemainder.subarray(offset, offset + maxValueSize));
			} else {
				newRemainder = streamRecordWithRemainder.subarray(offset);
			}
		}

		return { chunks, newRemainder };
	};
};

export const splitInChunks =
	(maxValueSize: number) =>
	(source: Observable<Uint8Array>): Observable<Uint8Array> => {
		let lastRemainder = new Uint8Array();
		let f = splitInChunksWithRemainder(lastRemainder, maxValueSize);

		return source.pipe(
			switchMap((s) => {
				const res = f(s);
				lastRemainder = res.newRemainder;
				f = splitInChunksWithRemainder(lastRemainder, maxValueSize);
				return from(res.chunks);
			}),
			(o) =>
				concat(
					o,
					defer(() => of(lastRemainder)),
				),
		);
	};
