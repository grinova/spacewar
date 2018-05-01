import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { synchronize } from './synchronize';
import {
  Synchronizer,
  SyncInvoker,
  UserData
} from './synchronizer';

export class Session {
  private synchronizer: Synchronizer<WorldData>;

  constructor(world: World<UserData>, invoker: SyncInvoker<WorldData>) {
    this.synchronizer = new Synchronizer(world, invoker, synchronize);
  }

  connect(): void {
    this.synchronizer.start();
  }

  disconnect(): void {
    this.synchronizer.stop();
  }
}
