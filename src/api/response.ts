export class ApiResponse {
	sid = '';
	data!: any;

	isSuccess() {
		return true;
	}
	isEnd() {
		return true;
	}
}
