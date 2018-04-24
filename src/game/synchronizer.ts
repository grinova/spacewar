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

export type Synchronize<T> = (world: World, data: SyncData<T>) => void;

export class Synchronizer<T>
implements Observer<SyncData<T>> {
  private world: World;
  private invoker: SyncInvoker<T>;
  private synchronize: Synchronize<T>;

  constructor(world: World, invoker: SyncInvoker<T>, synchronize: Synchronize<T>) {
    this.world = world;
    this.invoker = invoker;
    this.synchronize = synchronize;
  }

  notify(data: SyncData<T>): void {
    this.synchronize(this.world, data);
  }

  start(): void {
    this.invoker.register(this);
  }

  stop(): void {
    this.invoker.unregister(this);
  }
}
