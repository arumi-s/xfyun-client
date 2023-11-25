export class ApiResponse {
	sid = '';
	code = -1;
	message: string = '';

	data!: unknown;

	isSuccess(): boolean {
		return this.code === 0;
	}

	isEnd(): boolean {
		return true;
	}
}
