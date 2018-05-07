import { World } from 'classic2d';
import { Observer } from '../common/observable';
import { Invoker } from '../net/invoker';

export type ObjectType = 'arena' | 'ship-a' | 'ship-b' | 'rocket-a' | 'rocket-b' | 'black-hole';

export type TransmitDataType = 'ship-control';

export interface ShipControlAction {
  type: ActionType;
  amount?: number;
}

export type ActionType = 'throttle' | 'torque' | 'fire';

export interface TransmitData {
  type: TransmitDataType;
  action: ShipControlAction;
}

export interface UserData {
  id: string;
  type: ObjectType;
}

export type MessageType = 'world-data' | 'error';

export interface SyncData<T> {
  type: MessageType;
  data: T;
  error?: string;
}

export type SyncInvoker<T> = Invoker<TransmitData, SyncData<T>>;

export type Synchronize<T> = (world: World<UserData>, data: SyncData<T>) => void;

export class Synchronizer<T>
implements Observer<SyncData<T>> {
  private world: World<UserData>;
  private invoker: SyncInvoker<T>;
  private synchronize: Synchronize<T>;

  constructor(world: World<UserData>, invoker: SyncInvoker<T>, synchronize: Synchronize<T>) {
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
