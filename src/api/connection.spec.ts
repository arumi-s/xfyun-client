import { setTimeout } from 'timers/promises';
import { ApiConnection, ApiConnectionStatus, ApiResponse } from './';
import WS from 'jest-websocket-mock';

const mockAudioData = new Float32Array([
	0.7206806022877693, 0.9880034327888489, 0.06504866968584042, 0.845189929099083, 0.08407491356134272, 0.231458756327629,
	0.9117110967445373, 0.5238638138770954, 0.7760162358284376, 0.2141721503496219, 0.6363776561588533, 0.800752992141245, 0.5109836909776552,
	0.931700509477599, 0.8213112523086548, 0.1750978991396904, 0.4237758083527036, 0.5915443199873102, 0.18303511222617774,
	0.4282036264389862, 0.1203133920234648, 0.9715217996477389, 0.7129531611598215, 0.0824776889687914, 0.7046811193930588, 0.708594078176822,
	0.6838735052118396, 0.566437668469181, 0.6376781098779278, 0.852251309318542, 0.4739589753211831, 0.675861831386562, 0.8562286983126451,
	0.8185935108163476, 0.8969582461367518, 0.729585325880719, 0.10542764679039, 0.0199243701820663, 0.13052152233972056, 0.9833892737287987,
	0.8690447417930256, 0.5990975372286599, 0.3304890371955479, 0.9165250950580338, 0.3420503923944398, 0.584961464287398, 0.610081427661085,
	0.21839968991395486, 0.2368356748586086, 0.722844379745532, 0.3333503967888083, 0.935773422872296, 0.7297108830909862, 0.4710711498847177,
	0.5020081920876133, 0.865352808460791, 0.3431088873320543, 0.5581276377716462, 0.8194717222413908, 0.829396814077192, 0.3393389995920574,
	0.2810910051857215, 0.8041196579951412, 0.5076873990662985, 0.1450687114119384, 0.9868866413370383, 0.7056741736995923,
	0.05468189665630808, 0.4635264980804912, 0.8768787286191558, 0.845089636374878, 0.420621605850831, 0.2893310925135209, 0.6361232808883341,
	0.4311251208261072, 0.686715635855529, 0.2815553751660795, 0.756098392721632, 0.9563629496953554, 0.0980050521974506,
]);

describe('ApiConnection', () => {
	let connection: ApiConnection;
	let server: WS;

	afterEach(() => {
		server.close();
	});

	beforeEach(() => {
		server = new WS('ws://localhost:1234', { jsonProtocol: true });
		connection = new ApiConnection({ appId: 'abc', wsUrl: 'ws://localhost:1234' });
	});

	it('should fill default options', () => {
		const { option } = connection as unknown as { option: ApiConnection['option'] };
		expect(option.appId).toStrictEqual('abc');
		expect(option.wsUrl).toStrictEqual('ws://localhost:1234');
		expect(option.sampleRate).toStrictEqual(16000);
		expect(option.test).toStrictEqual(false);
	});

	it('should connect to api', async () => {
		const statusSubscriber = jest.fn();
		connection.getStatus().subscribe(statusSubscriber);

		await connection.connect();

		expect(statusSubscriber).toHaveBeenNthCalledWith(1, ApiConnectionStatus.null);
		expect(statusSubscriber).toHaveBeenNthCalledWith(2, ApiConnectionStatus.init);
		expect(statusSubscriber).toHaveBeenNthCalledWith(3, ApiConnectionStatus.ready);

		await connection.sendBuffer(mockAudioData, 1000);
		await setTimeout(40);
		await connection.sendBuffer(new Float32Array(mockAudioData.map((v) => -v)), 1000);

		connection.getStatus().subscribe((status) => {
			if (status === ApiConnectionStatus.end) {
				void setTimeout(80).then(() => server.send({ sid: '000', code: 0, data: 'xyz' }));
			}
		});

		await expect(connection.complete()).resolves.toBeInstanceOf(ApiResponse);

		expect(statusSubscriber).toHaveBeenNthCalledWith(4, ApiConnectionStatus.ing);
		expect(statusSubscriber).toHaveBeenNthCalledWith(5, ApiConnectionStatus.end);
		expect(statusSubscriber).toHaveBeenNthCalledWith(6, ApiConnectionStatus.result);

		expect(connection.getSid()).toStrictEqual('000');
		const response = connection.getResponse();
		expect(response.sid).toStrictEqual('000');
		expect(response.data).toStrictEqual('xyz');
		expect(response.isSuccess()).toStrictEqual(true);
		expect(response.isEnd()).toStrictEqual(true);

		expect(server).toHaveReceivedMessages([
			{
				data: {
					data: 'PlxbXnhglWKyZM9m7GgJayZtQ29gcX1zm3W4d9V58nsPfox4QHH0aahiXFsQVMRMeEUsPuA2lC9IKPwgsBlkEhgLJgxREnwYpx7SJP0qKDFTN349qUPUSf9PKlZVXH9iqmiXaZJjjl2KV4VRgUt8RXg/czlvM2stZidiIV0bWRVUDwoLNAxfDYkOsw/eEAgSMhNcFIcVsRbbFwYZMBpaG4Uc5R1GI6coCC5pM8k4Kj6LQ+xITE6tUw5Zb17QYzBpkW7ycw5y/W7sa9toymW5Yqhfl1yGWXVWZFNTUEJNMUogRw9EY0RiRmBIXkpdTFtOWVBYUlZUVFZTWFFaT1xOXkxgSmIwYb9cTljdU2xP+0qJRhhCpz02OcU0VDDjK3InACOPHmIcuR8PI2YmvCkTLWkwwDMWN206wz0aQXBEx0cdS3ROlVHiUi9Ue1XIVhVYYVmuWvtbSF2UXuFfLmF6YsdjFGVgZmdkHWLSX4hdPVvzWKhWXlQUUslPf000S+pIn0ZVRApCzUMhR3RKyE0bUW9UwlcWW2levWEQZWRot2sLb15ysnXKdup1C3UrdExzbXKNca5wzm/vbhBuMG1RbHFrkmqyaWBnRWIpXQ1Y8VLVTblInUOBPmU5SjQuLxIq9iTaH74atRatGKQamxyTHooggSJ5JHAmZyheKlYsTS5EMDwyMzQqNoQ32DgrOn870jwmPnk/zUAgQnRDyEQbRm9HwkgWSmlLOEn9RcNCiD9NPBI51zWdMmIvJyzsKLIldyI8HwEcxhiOGH4abhxfHk8gPyIvJB8mECgAKvAr4C3QL8ExsTOhNdo1azP8MIwuHSyuKT8n0CRhIvIfgh0TG6QYNRbGE1cRwxB+Fzge8ySuK2kyIzneP5lGVE0OVMlahGE/aPputHVTfEd6PHgxdiV0GnIPcANu+GvtaeJn1mXLY8BhtF+pXZ5bJ1crUi9NM0g3Qzs+PzlDNEcvSypPJVMgVxtbFl4RYgyrDZYSghdtHFghRCYvKxowBTXxOdw+x0OzSJ5NiVJ0VzVaPVpFWk1aVVpdWmVabVp1Wn1ahFqMWpRanFqkWqxapVpzWkFaD1rdWatZeVlHWRVZ41ixWH9YTVgbWOlXt1d5V4tWnlWwVMJT1VLnUflQC1AeTzBOQk1VTGdLeUqMSZ5I/kiOSR5Krko/S89LX0zvTH9NEE6gTjBPwE9QUOBQcVHHUnlULFbeV5BZQ1v1XKdeWWAMYr5jcGUiZ9Voh2o5bJtrnmigZaJipV+nXKlZrFauU7FQs021SrhHukS8Qb8+Jj2+PldA8EGIQyFFukZSSOtJhEscTbVOTVDmUX9TF1WrVhhYhVnyWl9czF05X6ZgE2KAY+5kW2bIZzVpomoPbHxtUW0FbblsbWwgbNRriGs8a/BqpGpXagtqv2lzaSdp22g7adlpeGoXa7VrVGzybJFtMG7Obm1vC3CqcElx53GGchZyw3Bwbx5uy2x4ayVq02iAZy1m2mSIYzVi4mCPXz1eoluzVsRR1EzlR/ZCBz4XOSg0OS9KKlolayB8G40WnRFiDbUMBwxaC60KAApTCaYI+QdMB58G8gVFBZgE6wM+A5ECZwNGBCYFBgbmBsYHpgiFCWUKRQslDAUN5Q3EDqQPhBD/Fb0ceyM5Kvgwtjd0PjJF8EuuUmxZKmDpZqdtZXQje1V9bXyGe556t3nPeOh3AXc=',
					status: 0,
				},
			},
			{
				data: {
					data: 'GXYydUp0Y3N7cpRxrXDFb15uPGwZavdn1WWyY5Bhbl9LXSlbB1nkVsJUoFJ9UFtOOUwaSvpH2kW7Q5tBez9cPTw7HDn9Nt00vTKeMH4uXyxrKg0vrzNROPM8lUE3RtlKe08dVMBYYl0EYqZmSGvqb4x0hHH5bG9o5GNZX85aRFa5US5NpEgZRI4/BDt5Nu4xZC0FLfAu3DDIMrM0nzaLOHY6YjxOPjlAJUIQRPxF6EfTSfZKKUtcS49LwUv0SydMWkyNTMBM80wlTVhNi02+TfFNQ00rShJH+UPgQMg9rzqWN300ZTFMLjMrGygCJekh0B73GxwcQRxnHIwcsRzXHPwcIR1GHWwdkR22HdwdAR4mHkwetyGPJWcpPi0WMe40xTidPHVATEQkSPxL00+rU4JXWltgWkxXOFQjUQ9O+0rmR9JEvkGpPpU7gThsNVgyRC8wLBQt1zGaNl47IUDkRKdJa04uU/FXtFx4YTtm/mrBb4V0QnehdQB0X3K+cB1vfG3bazpqmWj3ZlZltWMUYnNg0l4kXRhbDVkBV/ZU6lLfUNNOyEy8SrFIpkaaRI9Cg0B4Pmw8hjzEPAM9Qj2APb89/T08Pns+uT74PjY/dT+0P/I/MUBmQkVFJUgES+RNw1CiU4JWYVlAXCBf/2HfZL5nnWp9bXZsVWg0ZBNg8lvRV7BTj09uS01HLEMLP+o6yTaoMocuiiw9LvAvozFXMwo1vTZwOCM61zuKPT0/8ECjQlZECkbNR95J70sAThFQIlIzVERWVVhmWndciF6ZYKpiu2TLZtxo92gLaR9pM2lHaVtpb2mEaZhprGnAadRp6Gn8aRBqJGoRZzJjUl9yW5JXslPST/NLE0gzRFNAczyTOLM01DD0LCcrsSo7KsUpTynaKGQo7id4JwInjCYWJqAlKiW1JD8ktCXXKfktHDI+NmE6hD6mQslG60oOTzBTU1d2W5hfu2NjZgtks2FcXwRdrFpUWPxVpFNMUfROnExESuxHlEU8Q99AAT4jO0U4ZzWJMqwvzizwKRInNCRWIXgemhu8GN4VABM2GN4ehSUtLNUyfTklQMxGdE0cVMRaa2ETaLtuY3ULfNp8oXpoeC929nO8cYNvSm0Ra9hon2ZmZCxi81+6XYFb6VfEUp5NeUhTQy0+CDniM70ulylyJEwfJxoBFdsPtgrmByELXQ6YEdQUDxhLG4YewSH9JDgodCuvLusxJjViOJ474z4nQmxFsEj1SzpPflLDVQdZTFyRX9ViGmZeaaNs528CcMJvgm9BbwFvwW6AbkBuAG6/bX9tP23+bL5sfmw9bMppbmYTY7hfXVwCWadVTFLxTpZLO0jgRIVBKT7OOnM3TDVCNDkzLzIlMRswEi8ILv4s9SvrKuEp1yjOJ8QmuiXvJa0oayspLucwpDNiNiA53jucPlpBGETWRpNJUUwPTzJRk0/0TVVMtkoXSXhH2UU6RJtC/UBeP789IDyBOuI4QzcZOR87JD0pPy5BNEM5RT5HRElJS05NVE9ZUV5TY1VpV3ZVQlIOT9pLpkhyRT5CCj/WO6I4bjU6MgYv0iueKGolLCbtKa0tbjEuNe44rzxvQDBE8EexS3FPMlPyVrJac15gYfZii2QgZrZnS2nganZsC26gbzZxy3JgdPZ1i3cgeR95VnKMa8Nk+l0xV2dQnknVQgw8QjV5LrAn5yAdGlQTiww=',
					status: 1,
				},
			},
			{
				data: {
					data: 'waOkoYefap1NmzCZE5f2lNmSvJCfjoKMZYpIiCqGDYTwgXOHv44Llledo6Tvqzuzh7rTwR/Ja9C31wPfUOac7ej02vOv7YTnWeEu2wPV2M6tyILCV7wstgGw1qmro4CdVZdolm2ccaJ2qHquf7SDuojAjMaRzJXSmtie3qPkp+qs8Pb0y/Oh8nfxTfAi7/jtzuyj63nqT+kk6Prm0OWm5HvjGuK63FnX+NGXzDbH1cF1vBS3s7FSrPGmkaEwnM+WbpENjPGNApETlCSXNZpGnVegaKN5poqpm6ysr72yzrXfuPC7nLueuZ+3obWjs6Sxpq+oramrq6mtp66lsKOyobOftZ3PnkCjsacirJSwBbV2uee9WMLJxjvLrM8d1I7Y/9xw4Z7jR+Dx3JrZRNbt0pfPQMzpyJPFPMLmvo+7ObjitIyxaq4drdGrhKo3qeunnqZRpQSkuKJroR6g0p6FnTic7JqfmZib4p0toHeiwqQMp1epoavsrTawgbLLtBa3YLmru/W9MrzfuIu1OLLkrpGrPajqpJahQp7vmpuXSJT0kKGNTYo1iRWK9IrUi7OMko1yjlGPMZAQkfCRz5Kuk46UbZVNlp+Yu53XovOnDq0qska3Yrx+wZrGtsvS0O7VCtsm4ELlSulT51zlZONt4Xbff92H25DZmdeh1arTs9G7z8TNzcvVyXzIKMfUxYHELcPawYbAM7/fvYy8OLvkuZG4PbfqtZa0x7YCuj29eMCyw+3GKMpjzZ7Q2dMT107aid3E4P/jOedy54LlkeOh4bHfwd3R2+DZ8NcA1hDUH9Iv0D/OT8xfyibKlcwEz3PR4tNR1sHYMNuf3Q7gfeLs5Fzny+k67KnuPe+C6MfhDdtS1JfN3MYhwGe5rLLxqzale57AlwaRS4qsg7iFw4fOidqL5Y3wj/yRB5QSlh6YKZo0nECeS6BWomKk2KjUrdGyzbfJvMXBwca9y7nQtdWx2q3fqeSl6aHunfNV8mntfuiT46jevNnR1ObP+soPxiTBOLxNt2Kydq2LqMqlwqW6pbKlqqWipZqlk6WLpYOle6VzpWulY6VbpVOlWqWMpb6l8KUiplSmhqa4puqmHKdOp4CnsqfkpxaoSKiGqHSpYqpPqz2sK60Zrgav9K/isM+xvbKrs5i0hrV0tmG3ArdxtuG1UbXBtDG0oLMQs4Cy8LFgsc+wP7Cvrx+vj644rYar1KkhqG+mvaQKo1ihpp/0nUGcj5rdmCqXeJXGk2SUYpdfml2dW6BYo1amVKlRrE+vTLJKtUi4RbtDvkHB2sJBwai/EL53vN66RrmttxS2fLTjskuxsq8ZroGs6KpUqeeneqYNpaCjM6LGoFmf7J1/nBKbpZk4mMuWXZXwk4OSrpL6kkaTk5PfkyuUd5TDlA+VXJWolfSVQJaMltiWJZfEliaWh5XplEqUq5MNk26S0JExkZKQ9I9Vj7aOGI55jemNPI+PkOKRNJOHlNqVLZd/mNKZJZt4nMqdHZ9woMOhXaRMqTyuK7MauAq9+cHoxtfLx9C21aXald+E5HPpYu6e8kvz+POl9FP1APat9lr3B/i0+GH5Dvq7+mj7FfzC/G/9mfy6+9r6+vka+Tr4Wvd79pv1u/Tb8/vyG/I78VzwfO8B6kPjhNzG1QjPSsiMwc66D7RRrZOm1Z8XmViSmovchKqCkoN5hGGFSIYwhxeI/4g=',
					status: 1,
				},
			},
			{
				data: {
					data: '5onNirWLnIyEjWuOU486kKGRw5PmlQiYKppNnG+ekqC0otak+aYbqT2rYK2Cr6SxxrPmtQa4JbpFvGW+hMCkwsTE48YDySPLQs1iz4HRodOV1fPQUcyvxw3Dar7IuSa1hLDiq0CnnqL7nVmZt5QVkHOLe44Gk5GXG5ymoDGlvKlGrtGyXLfmu3HA/MSHyRHOnNL70g/RJM84zUzLYcl1x4nFnsOywca/273vuwO6GLgstgm11rSktHG0PrQLtNizpbNzs0CzDbPasqeydLJCsg+yvLLVte64BrwfvzjCUcVpyILLm8600czU5df+2hfeL+EJ5OTjv+OZ43TjT+Mp4wTj3+K54pTib+JJ4iTi/+HZ4bThSN5x2pnWwdLqzhLLOsdjw4u/s7vctwS0LLBVrH2opaSfpbOoyKvcrvCxBbUZuC27Qr5WwWrEf8eTyqfNvNDQ0+zSKc5lyaLE378bu1i2lbHSrA6oS6OInsSZAZU+kHuLvYheiv+LoI1Bj+KQg5IllMaVZ5cImamaSpzrnYyfLaHcouek86b+qAqrFa0gryyxN7NDtU63Wrllu3G9fL+IwZPDesM7w/3CvsJ/wkHCAsLDwYXBRsEIwcnAisBMwA3Az7+Zvbq627f7tByyPK9drH6pnqa/o9+gAJ4hm0GYYpWCkomTqpfLm+yfDaQuqE+scLCRtLK407z0wBXFNslYzXnRdtPD0Q/QXM6pzPbKQ8mPx9zFKcR2wsPAD79cvam79rkyuCG2ELT/se6v3a3Mq7upqqeZpYijeKFnn1adRZs0mSOXCJf0luCWzJa4lqSWkJZ8lmiWU5Y/liuWF5YDlu+V25XumM6crqCNpG2oTawtsA207bfNu6y/jMNsx0zLLM8M09nUT9XE1TrWsNYm15zXEtiI2P7YdNnp2V/a1dpL28HbTNop1gbS5M3ByZ/FfMFZvTe5FLXysM+srKiKpGegRZycmfSbTJ6koPyiVKWspwSqXKy0rgyxZLO7tRO4a7rDvCC//sHcxLrHmMp2zVTQMtMQ1u7YzNuq3ojhZuRE5yHq/+zK5yLhetrS0yvNg8bbvzO5i7LjqzyllJ7sl0SRnIr1gyWDXoWXh9CJCoxDjnyQtZLulCeXYZmam9OdDKBFon6kFqg8rWGyh7esvNLB+MYdzEPRaNaO27Tg2eX/6iTwSvUa+N/0o/Fo7izr8ee15HrhPt4D28fXjNRQ0RXO2cqex2LEHcHYvZS6T7cKtMawga09qvims6NvoCqd5pmhllyTGJD9jz2QfZC+kP6QPpF/kb+R/5FAkoCSwZIBk0GTgpPCkzaWkZnsnEegoqP9pliqs60PsWq0xbcgu3u+1sExxYzIs8q9y8fM0c3azuTP7tD40QHTC9QV1R/WKNcy2DzZRdoR2lPXldTX0RnPW8ydyd/GIcRkwaa+6LsquWy2rrPwsM6ubbAMsquzSbXotoe4JrrFu2S9A7+iwEHC4MN/xR3HvMjmxuHE3MLWwNG+zLzGusG4vLa2tLGyrLCnrqGsnKqXqImqva3xsCW0WbeNusG99cApxF3HkcrFzfnQLdRi15ba09kT1lLSks7SyhHHUcOQv9C7D7hPtI6wzqwNqU2ljKGfngmddJvfmUmYtJYflYmT9JFfkMmONI2fiwmKdIjfhuCGqo1zlDybBaLPqJivYbYrvfTDvcqH0VDYGd/i5azsdfM=',
					status: 1,
				},
			},
			{
				data: {
					status: 2,
				},
			},
		]);
	});

	it('should throw error', async () => {
		const statusSubscriber = jest.fn();
		connection.getStatus().subscribe(statusSubscriber);

		await connection.connect();

		expect(statusSubscriber).toHaveBeenNthCalledWith(1, ApiConnectionStatus.null);
		expect(statusSubscriber).toHaveBeenNthCalledWith(2, ApiConnectionStatus.init);
		expect(statusSubscriber).toHaveBeenNthCalledWith(3, ApiConnectionStatus.ready);

		await connection.sendBuffer(mockAudioData, 1000);
		await setTimeout(40);
		server.send({ sid: '000', code: 10000, message: 'Some error occurred.' });

		await expect(connection.complete()).rejects.toThrow(new Error('error 10000: Some error occurred.'));

		expect(statusSubscriber).toHaveBeenNthCalledWith(4, ApiConnectionStatus.ing);
		expect(statusSubscriber).toHaveBeenNthCalledWith(5, ApiConnectionStatus.error);

		expect(connection.getSid()).toStrictEqual('000');
		const response = connection.getResponse();
		expect(response).toBeUndefined();
	});
});
