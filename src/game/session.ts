import { World } from 'classic2d';
import { Synchronizer, SyncInvoker } from './synchronizer';
import { WorldData } from 'serializers/world';

export class Session {
  private synchronizer: Synchronizer<WorldData>;

  constructor(world: World, invoker: SyncInvoker<WorldData>) {
    this.synchronizer = new Synchronizer(world, invoker);
  }

  connect(): void {
    this.synchronizer.start();
  }

  disconnect(): void {
    this.synchronizer.stop();
  }
}
