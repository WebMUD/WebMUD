import { Server } from './server';

export abstract class WebMUDServerPlugin {
  abstract init(server: Server): void;
}
