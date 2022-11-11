import { LocalConnection } from './local-connection';

test('LocalConnection', () => {
  let data = ['', ''];

  let connPair = LocalConnection.create();

  connPair[0].onData(x => (data[0] = x));
  connPair[1].onData(x => (data[1] = x));

  connPair[0].send('test 0');
  connPair[1].send('test 1');

  expect(data[0]).toBe('test 1');
  expect(data[1]).toBe('test 0');
});
