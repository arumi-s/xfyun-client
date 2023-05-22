import { from } from 'rxjs';
import { splitInChunks } from './splitInChunks';

describe('splitInChunks', () => {
	it('should split rxjs data into fixed length chunks', () => {
		const subscriber = jest.fn();

		from([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])])
			.pipe(splitInChunks(2))
			.subscribe(subscriber);

		expect(subscriber).toHaveBeenNthCalledWith(1, new Uint8Array([0, 1]));
		expect(subscriber).toHaveBeenNthCalledWith(2, new Uint8Array([2, 3]));
		expect(subscriber).toHaveBeenNthCalledWith(3, new Uint8Array([4, 5]));
		expect(subscriber).toHaveBeenNthCalledWith(4, new Uint8Array([6, 7]));
	});

	it('should handle trailing data', () => {
		const subscriber = jest.fn();

		from([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])])
			.pipe(splitInChunks(3))
			.subscribe(subscriber);

		expect(subscriber).toHaveBeenNthCalledWith(1, new Uint8Array([0, 1, 2]));
		expect(subscriber).toHaveBeenNthCalledWith(2, new Uint8Array([3, 4, 5]));
		expect(subscriber).toHaveBeenNthCalledWith(3, new Uint8Array([6, 7, 8]));
		expect(subscriber).toHaveBeenNthCalledWith(4, new Uint8Array([9]));
	});

	it('should join consecutive data', () => {
		const subscriber = jest.fn();

		from([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8])])
			.pipe(splitInChunks(4))
			.subscribe(subscriber);

		expect(subscriber).toHaveBeenNthCalledWith(1, new Uint8Array([0, 1, 2, 3]));
		expect(subscriber).toHaveBeenNthCalledWith(2, new Uint8Array([4, 5, 6, 7]));
		expect(subscriber).toHaveBeenNthCalledWith(3, new Uint8Array([8, 9, 0, 1]));
		expect(subscriber).toHaveBeenNthCalledWith(4, new Uint8Array([2, 3, 4, 5]));
		expect(subscriber).toHaveBeenNthCalledWith(5, new Uint8Array([6, 7, 8]));
	});
});
