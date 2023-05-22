import type {
	IseRequestBusinessLanguage,
	IseRequestBusinessCategory,
	IseRequestBusinessGroup,
	IseRequestBusinessSampleRate,
} from './request';
import type { ApiOption } from '../api';

export class IseOption implements ApiOption {
	readonly appId!: string;
	readonly wsUrl!: string;
	readonly language: IseRequestBusinessLanguage = 'en_vip';
	readonly category: IseRequestBusinessCategory = 'read_sentence';
	readonly group: IseRequestBusinessGroup = 'adult';
	readonly text: string = '';
	readonly sampleRate: IseRequestBusinessSampleRate = 16000;
	readonly test: boolean = false;
}
