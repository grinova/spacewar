import { Observer } from '../common/observable';
import { Invoker } from '../net/invoker';
import { ControllerData } from '../serializers/controller';
import { WorldData } from '../serializers/world';

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

export interface SyncData<T, D> {
  type: T;
  data: D;
}

type WorldSyncData = SyncData<'world-sync', WorldData>;
type ControllerActionData = SyncData<'controller-action', ControllerData>;
type ErrorSyncData = SyncData<'error', string>;

export type ReceiveData = WorldSyncData | ControllerActionData | ErrorSyncData;

export type SyncInvoker = Invoker<TransmitData, ReceiveData>;

export type OnReceive<T> = (data: T) => void;
export interface SynchronizerHandlers {
  onSyncWorld: OnReceive<WorldData>;
  onActionController: OnReceive<ControllerData>;
  onError: OnReceive<string>;
}

export class Synchronizer
implements Observer<ReceiveData> {
  private invoker: SyncInvoker;
  private handlers: SynchronizerHandlers;

  constructor(invoker: SyncInvoker, handlers: SynchronizerHandlers) {
    this.invoker = invoker;
    this.handlers = handlers;
  }

  notify(data: ReceiveData): void {
    switch (data.type) {
      case 'world-sync':
        this.handlers.onSyncWorld(data.data);
        break;
      case 'controller-action':
        this.handlers.onActionController(data.data);
        break;
      case 'error':
        this.handlers.onError(data.data);
        break;
    }
  }

  start(): void {
    this.invoker.register(this);
  }

  stop(): void {
    this.invoker.unregister(this);
  }
}
