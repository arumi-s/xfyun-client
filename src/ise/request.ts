export type IseRequestBusinessLanguage = 'zh_vip' | 'en_vip';
export type IseRequestBusinessCategory =
	| 'read_syllable'
	| 'read_word'
	| 'read_sentence'
	| 'read_chapter'
	| 'simple_expression'
	| 'read_choice'
	| 'topic'
	| 'retell'
	| 'picture_talk'
	| 'oral_translation';
export type IseRequestBusinessGroup = 'pupil' | 'youth' | 'adult';
export type IseRequestBusinessExtraAbility = 'multi_dimension' | 'pitch' | 'syll_phone_err_msg';
export type IseRequestBusinessCheckType = 'easy' | 'common' | 'hard';
export type IseRequestBusinessGrade = 'junior' | 'middle' | 'senior';
export type IseRequestBusinessRst = 'entirety' | 'plain';

export type IseRequestBusinessEncoding = 'raw' | 'lame' | 'speex-wb;7';
export type IseRequestBusinessSampleRate = 8000 | 12000 | 16000;

export type IseRequest = IseRequest1 | IseRequest2;

export interface IseRequest1 {
	common: IseRequestCommon;
	business: IseRequestBusiness1;
	data: IseRequestData;
}

export interface IseRequest2 {
	business: IseRequestBusiness2 | IseRequestBusiness4;
	data: IseRequestData;
}

export interface IseRequestCommon {
	app_id: string;
}

export interface IseRequestData {
	status: 0 | 1 | 2;
	encoding: IseRequestBusinessEncoding;
	data: string;
}

export interface IseRequestBusiness1 {
	text: string;
	category: IseRequestBusinessCategory;
	group: IseRequestBusinessGroup;
	sub: 'ise';
	ent: IseRequestBusinessLanguage;
	tte: 'utf-8';
	ttp_skip: boolean;
	cmd: 'ssb';
	auf: `audio/L16;rate=${IseRequestBusinessSampleRate}`;
	aus: 1;
	aue: IseRequestBusinessEncoding;
	rstcd?: 'utf8';
	rst?: IseRequestBusinessRst;
	extra_ability?: IseRequestBusinessExtraAbility;
	check_type?: IseRequestBusinessCheckType;
	grade?: IseRequestBusinessGrade;
	ise_unite?: '0' | '1';
	plev?: '0' | '1';
}

export interface IseRequestBusiness2 {
	cmd: 'auw';
	aus: 2;
	aue: IseRequestBusinessEncoding;
}

export interface IseRequestBusiness4 {
	cmd: 'auw';
	aus: 4;
	aue: IseRequestBusinessEncoding;
}
