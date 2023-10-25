export class ApiResponse {
	sid = '';
	data!: any;

	isSuccess(): boolean {
		return true;
	}
	isEnd(): boolean {
		return true;
	}
}
