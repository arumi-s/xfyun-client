import { ApiConnection } from '../api';
import { IatOption } from './option';
import { IatRequest } from './request';
import { IatResponse } from './response';

export class IatConnection extends ApiConnection<IatOption, IatRequest, IatResponse> {
	protected override Option() {
		return new IatOption();
	}

	protected override Response() {
		return new IatResponse();
	}

	protected override wrapEnd() {
		return {
			data: {
				status: 2,
				format: `audio/L16;rate=${this.option.sampleRate}`,
				encoding: 'raw',
				audio: '',
			},
		} as const;
	}

	protected override wrapAudioFirst(data: string) {
		return {
			common: {
				app_id: this.option.appId,
			},
			business: {
				language: this.option.language,
				domain: this.option.domain,
				...(this.option.language === 'zh_cn' ? { accent: this.option.accent } : {}),
			},
			data: {
				status: 0,
				format: `audio/L16;rate=${this.option.sampleRate}`,
				encoding: 'raw',
				audio: data,
			},
		} as const;
	}

	protected override wrapAudio(data: string) {
		return {
			data: {
				status: 1,
				format: `audio/L16;rate=${this.option.sampleRate}`,
				encoding: 'raw',
				audio: data,
			},
		} as const;
	}

	protected override onResponseSuccess(response: IatResponse) {
		if (this.response == null) {
			this.response = response;
		} else {
			if (this.response.data.result) {
				this.response.data.result.ws.push(...(response?.data?.result?.ws ?? []));
			}
		}
	}

	protected override onResponseFail(response: IatResponse) {
		throw new Error(`Error ${response.code}: ${response.message}`);
	}
}
