export interface ApiRequest {
	data: ApiRequestData;
}

export interface ApiRequestData {
	status: 0 | 1 | 2;
}
