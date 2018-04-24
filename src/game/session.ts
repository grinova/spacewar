import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { synchronize } from './synchronize';
import { Synchronizer, SyncInvoker } from './synchronizer';

export class Session {
  private synchronizer: Synchronizer<WorldData>;

  constructor(world: World, invoker: SyncInvoker<WorldData>) {
    this.synchronizer = new Synchronizer(world, invoker, synchronize);
  }

  connect(): void {
    this.synchronizer.start();
  }

  disconnect(): void {
    this.synchronizer.stop();
  }
}
