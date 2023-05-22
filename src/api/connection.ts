import { BehaviorSubject, concatMap, delay, delayWhen, filter, finalize, firstValueFrom, of, Subject } from 'rxjs';
import { resample } from '../utils/resample';
import { to16BitPCM } from '../utils/to16BitPCM';
import { splitInChunks } from '../utils/splitInChunks';
import { ApiConnectionStatus } from './status';
import { ApiOption, AuthOption } from './option';
import type { ApiRequest } from './request';
import { ApiResponse } from './response';
import { toBase64 } from '../utils/toBase64';

const chuckLength = 1280;
const chuckDelay = 40;

export class ApiConnection<O extends ApiOption = ApiOption, Req extends ApiRequest = ApiRequest, Res extends ApiResponse = ApiResponse> {
	protected option: O;
	protected webSocket!: WebSocket;
	protected response!: Res;
	protected sid = '';
	protected $status = new BehaviorSubject<ApiConnectionStatus>(ApiConnectionStatus.null);
	protected $audio = new Subject<Uint8Array>();

	protected Option(): O {
		return new ApiOption() as O;
	}

	protected Response(): Res {
		return new ApiResponse() as Res;
	}

	constructor(option: Partial<O> & AuthOption) {
		this.option = Object.assign(this.Option(), option);

		this.$audio
			.pipe(
				delayWhen(() => this.$status.pipe(filter((status) => status === ApiConnectionStatus.ready || status === ApiConnectionStatus.ing))),
				splitInChunks(chuckLength),
				concatMap((x) => of(x).pipe(delay(chuckDelay))),
				finalize(() => this.sendEnd()),
			)
			.subscribe((buffer) => this.sendAudio(buffer));
	}

	protected setStatus(status: ApiConnectionStatus) {
		if (this.$status.value !== status) {
			this.$status.next(status);
		}
	}

	getStatus() {
		return this.$status.asObservable();
	}

	getSid() {
		return this.sid;
	}

	async sendAudioBuffer(audioBuffer: AudioBuffer) {
		const sourceBuffer = audioBuffer.getChannelData(0);

		return await this.sendBuffer(sourceBuffer, audioBuffer.sampleRate);
	}

	async sendBuffer(sourceBuffer: Float32Array, sampleRate: number) {
		const buffer = resample(sourceBuffer, sampleRate, this.option.sampleRate);

		return await this.send16kBuffer(buffer);
	}

	async send16kBuffer(buffer: Float32Array) {
		this.$audio.next(to16BitPCM(buffer));

		return Promise.resolve();
	}

	async complete() {
		this.$audio.complete();
		await firstValueFrom(this.$status.pipe(filter((status) => status === ApiConnectionStatus.result)));
		this.$status.complete();
		return this.response;
	}

	async connect() {
		if (this.option.test) {
			this.setStatus(ApiConnectionStatus.init);
			this.setStatus(ApiConnectionStatus.ready);
			return;
		}
		return new Promise<void>((resolve, reject) => {
			try {
				this.webSocket = new WebSocket(this.option.wsUrl);
			} catch (e: unknown) {
				reject(e);
			}
			this.setStatus(ApiConnectionStatus.init);

			this.webSocket.onopen = () => {
				this.setStatus(ApiConnectionStatus.ready);
				resolve();
			};
			this.webSocket.onmessage = (event: MessageEvent<string>) => {
				const response = Object.assign(this.Response(), JSON.parse(event.data) as Res);
				this.setResponse(response);
			};
			this.webSocket.onerror = () => {
				this.setStatus(ApiConnectionStatus.error);
				reject(new Error('unable to connect'));
			};
		});
	}

	protected wrapEnd(): Req | null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return {
			data: {
				status: 2,
			},
		} as const as any;
	}

	protected wrapAudioFirst(data: string): Req | null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return {
			data: {
				status: 0,
				data,
			},
		} as const as any;
	}

	protected wrapAudio(data: string): Req | null {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return {
			data: {
				status: 1,
				data,
			},
		} as const as any;
	}

	protected sendRequest(request: Req) {
		this.webSocket.send(JSON.stringify(request));
	}

	protected sendAudio(audioChunk: Uint8Array) {
		const data = toBase64(audioChunk);
		if (this.$status.value === ApiConnectionStatus.ready) {
			this.setStatus(ApiConnectionStatus.ing);
			if (!this.option.test) {
				const wrapped = this.wrapAudioFirst(data);
				if (wrapped) this.sendRequest(wrapped);
			}
		} else {
			if (!this.option.test) {
				const wrapped = this.wrapAudio(data);
				if (wrapped) this.sendRequest(wrapped);
			}
		}
	}

	protected sendEnd() {
		if (!this.option.test) {
			const wrapped = this.wrapEnd();
			if (wrapped) this.sendRequest(wrapped);
		}
		this.setStatus(ApiConnectionStatus.end);

		if (this.option.test) {
			this.setStatus(ApiConnectionStatus.result);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onResponse(response: Res) {
		return null;
	}

	protected onResponseSuccess(response: Res) {
		this.response = response;
	}

	protected onResponseFail(response: Res) {
		console.log(response);
	}

	protected setResponse(response: Res) {
		if (response) {
			if (this.sid === '') {
				this.sid = response.sid;
			}
			this.onResponse(response);
		}

		if (response.isSuccess()) {
			this.onResponseSuccess(response);

			if (response.isEnd()) {
				this.setStatus(ApiConnectionStatus.result);

				this.webSocket?.close();
			}
		} else {
			this.webSocket?.close();
			this.onResponseFail(response);
		}
	}

	getResponse() {
		return this.response;
	}
}
