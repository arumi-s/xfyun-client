# Xfyun Client

[![NPM](https://img.shields.io/npm/v/xfyun-client)](https://www.npmjs.com/package/xfyun-client)
![License](https://img.shields.io/npm/l/xfyun-client)

## Install

```bash
npm install xfyun-client
```

### Install peer dependencies

```bash
npm install rxjs@7
```

## Usage

```typescript
import { IseConnection } from 'xfyun-client';

const connection = new IseConnection({
	language: 'en_vip',
	group: 'adult',
	category: 'read_sentence',
	text: '',
	appId: '',
	wsUrl: '',
});

await connection.connect();
await connection.sendAudioBuffer(data);
await connection.complete();

const response = connection.getResponse();
```
