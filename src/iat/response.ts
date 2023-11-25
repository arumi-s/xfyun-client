import { ApiResponse } from '../api';

export enum IatResponseDataStatus {
	START = 0,
	MIDDLE = 1,
	END = 2,
}

export interface IatResponseResult {
	ls: boolean;
	bg: number;
	ed: number;

	ws: IatResponseResultWord[];
	sn: number;
}

export interface IatResponseResultWord {
	bg: number;

	cw: IatResponseResultWordContent[];
}

export interface IatResponseResultWordContent {
	sc: number;
	w: string;
}

export interface IatResponseData {
	status: IatResponseDataStatus;
	result: IatResponseResult | null;
}

export class IatResponse extends ApiResponse {
	data!: IatResponseData;

	isEnd() {
		return this.data?.status === IatResponseDataStatus.END;
	}
}
