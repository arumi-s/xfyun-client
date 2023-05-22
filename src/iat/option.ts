import { IatRequestBusinessLanguage, IatRequestBusinessDomain, IatRequestBusinessAccent, IatRequestBusinessSampleRate } from './request';
import type { ApiOption } from '../api';

export class IatOption implements ApiOption {
	readonly appId!: string;
	readonly wsUrl!: string;
	readonly language: IatRequestBusinessLanguage = 'en_us';
	readonly domain: IatRequestBusinessDomain = 'iat';
	readonly accent: IatRequestBusinessAccent = '';
	readonly sampleRate: IatRequestBusinessSampleRate = 16000;
	readonly test: boolean = false;
}
