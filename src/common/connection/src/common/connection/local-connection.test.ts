import { LocalConnection } from './local-connection';

test('runAndPair', () => {
  let run = false;
  const cb = (data: string) => {
    expect(data).toBe('Test');
    run = true;
  };

  let connPair = LocalConnection.create();
  connPair[1].onData(cb);
  connPair[0].send('Test');
  expect(run).toBe(true);
});
