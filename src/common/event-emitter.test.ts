import { EventEmitter } from './event-emitter';

test('eventEmitter', () => {
  const eventEmitter = new EventEmitter();

  let run = false;

  const cb = (data: string) => {
    expect(data).toBe('test');
    run = true;
  };
  eventEmitter.add(cb);

  eventEmitter.emit('test');
  expect(run).toBe(true);
});

test('eventEmitter.remove()', () => {
  const eventEmitter = new EventEmitter();

  const cb = (data: string) => {
    throw 'This handler should never be triggered';
  };

  eventEmitter.add(cb);
  eventEmitter.remove(cb);

  eventEmitter.emit('test');
});
