export type IatRequestBusinessLanguage = 'zh_cn' | 'en_us';
export type IatRequestBusinessDomain =
	| 'iat'
	| 'medical'
	| 'gov-seat-assistant'
	| 'seat-assistant'
	| 'gov-ansys'
	| 'gov-nav'
	| 'fin-nav'
	| 'fin-ansys';
export type IatRequestBusinessAccent = 'mandarin' | '';
export type IatRequestBusinessDwa = 'wpgs';
export type IatRequestBusinessPd = 'game' | 'health' | 'shopping' | 'trip';
export type IatRequestBusinessRlang = 'zh-cn' | 'zh-hk';

export type IatRequestBusinessEncoding = 'raw' | 'lame' | 'speex' | 'speex-wb';
export type IatRequestBusinessSampleRate = 8000 | 16000;

export type IatRequest = IatRequest1 | IatRequest2;

export interface IatRequest1 {
	common: IatRequestCommon;
	business: IatRequestBusiness;
	data: IatRequestData;
}

export interface IatRequest2 {
	data: IatRequestData;
}

export interface IatRequestCommon {
	app_id: string;
}

export interface IatRequestData {
	status: 0 | 1 | 2;
	format: `audio/L16;rate=${IatRequestBusinessSampleRate}`;
	encoding: IatRequestBusinessEncoding;
	audio: string;
}

export interface IatRequestBusiness {
	language: IatRequestBusinessLanguage;
	domain: IatRequestBusinessDomain;
	accent?: IatRequestBusinessAccent;
	vad_eos?: number;
	dwa?: IatRequestBusinessDwa;
	pd?: IatRequestBusinessPd;
	ptt?: 0 | 1;
	rlang?: IatRequestBusinessRlang;
	vinfo?: 0 | 1;
	nunum?: 0 | 1;
	speex_size?: number;
	nbest?: number;
	wbest?: number;
}
