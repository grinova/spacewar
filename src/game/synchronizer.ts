import { World } from 'classic2d';
import { Observer } from '../common/observable';
import { Invoker } from '../net/invoker';

export interface UserData {
}

export type MessageType = 'world-data' | 'error';

export interface SyncData<T> {
  type: MessageType;
  data: T;
  error?: string;
}

export type SyncInvoker<T> = Invoker<UserData, SyncData<T>>;

export class Synchronizer<T>
implements Observer<SyncData<T>> {
  private world: World;
  private invoker: SyncInvoker<T>;

  constructor(world: World, invoker: SyncInvoker<T>) {
    this.world = world;
    this.invoker = invoker;
  }

  notify(data: SyncData<T>): void {
    console.log(data);
  }

  start(): void {
    this.invoker.register(this);
  }

  stop(): void {
    this.invoker.unregister(this);
  }
}
