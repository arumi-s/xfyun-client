import type { ApiResponse } from '../api';

export enum IseResponseDataStatus {
	START = 0,
	MIDDLE = 1,
	END = 2,
}

export interface IseResponseData {
	status: IseResponseDataStatus;
	data: string | null;
}

export class IseResponse implements ApiResponse {
	sid = '';
	code = -1;
	message = '';

	data!: IseResponseData;

	isSuccess() {
		return this.code === 0;
	}

	isEnd() {
		return this.data?.status === IseResponseDataStatus.END;
	}
}
