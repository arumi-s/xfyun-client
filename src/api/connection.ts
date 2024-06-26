import { BehaviorSubject, concatMap, delay, filter, finalize, firstValueFrom, Observable, of, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { resample } from '../utils/resample';
import { to16BitPCM } from '../utils/to16BitPCM';
import { splitInChunks } from '../utils/splitInChunks';
import { ApiConnectionStatus } from './status';
import { ApiOption, AuthOption } from './option';
import type { ApiRequest } from './request';
import { ApiResponse } from './response';
import { toBase64 } from '../utils/toBase64';
import { chuckLength, chuckDelay } from '../utils/const';

export class ApiConnection<O extends ApiOption = ApiOption, Req extends ApiRequest = ApiRequest, Res extends ApiResponse = ApiResponse> {
	protected option: O;
	protected response!: Res;
	protected $webSocket!: WebSocketSubject<Req | Res>;
	protected sid = '';
	protected $status = new BehaviorSubject<ApiConnectionStatus>(ApiConnectionStatus.null);
	protected firstSent = false;
	protected error: Error | null = null;

	/**
	 * A stream of 16 bit PCM data.
	 */
	protected $audio = new Subject<Uint8Array>();

	/**
	 * A stream of 16 bit PCM data chunked into `chuckLength` and seperated temporally by `chuckDelay`.
	 */
	protected $chunked: Observable<Uint8Array>;

	protected Option(): O {
		return new ApiOption() as O;
	}

	protected Response(): Res {
		return new ApiResponse() as Res;
	}

	constructor(option: Partial<O> & AuthOption) {
		this.option = Object.assign(this.Option(), option);

		this.$chunked = this.$audio.pipe(
			splitInChunks(chuckLength),
			concatMap((x) => of(x).pipe(delay(chuckDelay))),
			finalize(() => this.sendEnd()),
		);

		this.$chunked.subscribe((buffer) => this.sendAudio(buffer));
	}

	protected setStatus(status: ApiConnectionStatus): void {
		if (this.$status.value !== status) {
			this.$status.next(status);
		}
	}

	getSid(): string {
		return this.sid;
	}

	getStatus(): Observable<ApiConnectionStatus> {
		return this.$status.asObservable();
	}

	/**
	 * @returns the {@link $audio}
	 */
	getAudio(): Observable<Uint8Array> {
		return this.$audio.asObservable();
	}

	/**
	 * @returns the {@link $chunked}
	 */
	getChunked(): Observable<Uint8Array> {
		return this.$chunked;
	}

	async sendAudioBuffer(audioBuffer: AudioBuffer): Promise<void> {
		const sourceBuffer = audioBuffer.getChannelData(0);

		return await this.sendBuffer(sourceBuffer, audioBuffer.sampleRate);
	}

	async sendBuffer(sourceBuffer: Float32Array, sampleRate: number): Promise<void> {
		const buffer = resample(sourceBuffer, sampleRate, this.option.sampleRate);

		return await this.send16kBuffer(buffer);
	}

	async send16kBuffer(buffer: Float32Array): Promise<void> {
		this.$audio.next(to16BitPCM(buffer));

		return await Promise.resolve();
	}

	async send16BitPCMBuffer(buffer: Uint8Array): Promise<void> {
		this.$audio.next(buffer);

		return await Promise.resolve();
	}

	async complete(): Promise<Res> {
		this.$audio.complete();
		const status = await firstValueFrom(
			this.$status.pipe(filter((status) => status === ApiConnectionStatus.result || status === ApiConnectionStatus.error)),
		);

		this.$status.complete();

		if (status === ApiConnectionStatus.error) {
			throw this.error;
		}
		return this.response;
	}

	async connect(): Promise<void> {
		if (this.option.test) {
			this.setStatus(ApiConnectionStatus.init);
			this.setStatus(ApiConnectionStatus.ready);
			return;
		}
		return new Promise<void>((resolve, reject) => {
			this.setStatus(ApiConnectionStatus.init);
			this.$webSocket = webSocket({
				url: this.option.wsUrl,
				openObserver: {
					next: () => {
						this.setStatus(ApiConnectionStatus.ready);
						resolve();
					},
				},
			});

			this.$webSocket.subscribe({
				next: (msg) => {
					const response = Object.assign(this.Response(), msg);
					this.setResponse(response);
				},
				error: () => {
					this.setStatus(ApiConnectionStatus.error);
					reject((this.error = new Error('unable to connect')));
				},
			});
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

	protected sendRequest(request: Req): void {
		const status = this.$status.value;
		if (status === ApiConnectionStatus.error) return;

		this.$webSocket.next(request);
	}

	protected sendAudio(audioChunk: Uint8Array): void {
		const status = this.$status.value;
		const data = toBase64(audioChunk);
		if (status < ApiConnectionStatus.ing) {
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

	protected sendEnd(): void {
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
	protected onResponse(response: Res): void {
		return;
	}

	protected onResponseSuccess(response: Res): void {
		this.response = response;
	}

	protected onResponseFail(response: Res): void {
		throw new Error(`error ${response.code}: ${response.message}`);
	}

	protected setResponse(response: Res): void {
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

				this.$webSocket?.complete();
			}
		} else {
			this.$webSocket?.complete();
			this.setStatus(ApiConnectionStatus.error);
			try {
				this.onResponseFail(response);
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.error = err;
				}
			}
		}
	}

	getResponse(): Res {
		return this.response;
	}
}
