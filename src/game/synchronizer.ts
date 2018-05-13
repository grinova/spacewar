import { Body, World } from 'classic2d';
import { Observer } from '../common/observable';
import { Invoker } from '../net/invoker';

export type ObjectType = 'arena' | 'ship' | 'rocket' | 'black-hole';

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

export interface RocketProperties {
  owner: string;
}

export interface ShipUserData {
  id: string;
  type: 'ship';
}

interface RocketUserData {
  id: string;
  type: 'rocket';
  properties: RocketProperties;
}

interface CommonUserData {
  id: string;
  type: 'arena' | 'black-hole';
}

export type UserData = CommonUserData | ShipUserData | RocketUserData;

export type MessageType = 'world-data' | 'error';

export interface SyncData<T> {
  type: MessageType;
  data: T;
  error?: string;
}

export type SyncInvoker<T> = Invoker<TransmitData, SyncData<T>>;

export type Synchronize<T> = (world: World<UserData>, data: SyncData<T>, handlers?: void | SynchronizerHandlers) => void;

export type BodyHandler = (body: Body<UserData>) => void;

export interface SynchronizerHandlers {
  onBodyCreate?: void | BodyHandler;
  onBodyDestroy?: void | BodyHandler;
}

export class Synchronizer<T>
implements Observer<SyncData<T>> {
  private world: World<UserData>;
  private invoker: SyncInvoker<T>;
  private synchronize: Synchronize<T>;
  private handlers?: void | SynchronizerHandlers;

  constructor(world: World<UserData>, invoker: SyncInvoker<T>, synchronize: Synchronize<T>, handlers?: void | SynchronizerHandlers) {
    this.world = world;
    this.invoker = invoker;
    this.synchronize = synchronize;
    this.handlers = handlers;
  }

  notify(data: SyncData<T>): void {
    this.synchronize(this.world, data, this.handlers);
  }

  start(): void {
    this.invoker.register(this);
  }

  stop(): void {
    this.invoker.unregister(this);
  }
}
