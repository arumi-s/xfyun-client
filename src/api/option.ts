export interface AuthOption {
	readonly appId: string;
	readonly wsUrl: string;
}

export class ApiOption implements AuthOption {
	readonly appId!: string;
	readonly wsUrl!: string;
	readonly sampleRate: number = 16000;
	readonly test: boolean = false;
}
