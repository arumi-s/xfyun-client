import { ApiResponse } from '../api';

export enum IseResponseDataStatus {
	START = 0,
	MIDDLE = 1,
	END = 2,
}

export interface IseResponseData {
	status: IseResponseDataStatus;
	data: string | null;
}

export class IseResponse extends ApiResponse {
	data!: IseResponseData;

	isEnd() {
		return this.data?.status === IseResponseDataStatus.END;
	}
}
