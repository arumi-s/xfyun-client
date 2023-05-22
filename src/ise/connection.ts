import { IseOption } from './option';
import { ApiConnection } from '../api';
import { IseResponse } from './response';
import type { IseRequest } from './request';

export class IseConnection extends ApiConnection<IseOption, IseRequest, IseResponse> {
	protected override Option() {
		return new IseOption();
	}

	protected override Response() {
		return new IseResponse();
	}

	protected override wrapEnd() {
		return {
			business: {
				cmd: 'auw',
				aus: 4,
				aue: 'raw',
			},
			data: {
				status: 2,
				encoding: 'raw',
				data: '',
			},
		} as const;
	}

	protected override wrapAudioFirst(data: string) {
		return {
			common: {
				app_id: this.option.appId,
			},
			business: {
				category: this.option.category,
				rstcd: 'utf8',
				group: this.option.group,
				sub: 'ise',
				ent: this.option.language,
				tte: 'utf-8',
				ttp_skip: true,
				cmd: 'ssb',
				auf: `audio/L16;rate=${this.option.sampleRate}`,
				aus: 1,
				aue: 'raw',
				text: '\uFEFF' + this.option.text,
			},
			data: {
				status: 0,
				encoding: 'raw',
				data,
			},
		} as const;
	}

	protected override wrapAudio(data: string) {
		return {
			business: {
				cmd: 'auw',
				aus: 2,
				aue: 'raw',
			},
			data: {
				status: 1,
				encoding: 'raw',
				data,
			},
		} as const;
	}

	protected override onResponseFail(response: IseResponse) {
		throw new Error(`Error ${response.code}: ${response.message}`);
	}
}
