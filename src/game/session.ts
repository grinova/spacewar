import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { synchronize } from './synchronize';
import { SynchronizerHandlers } from './synchronizer';
import {
  Synchronizer,
  SyncInvoker,
  UserData
} from './synchronizer';

export interface SessionHandlers extends BaseSessionHandlers, SynchronizerHandlers {}

interface BaseSessionHandlers {
  onConnect?: void | (() => void);
  onDisconnect?: void | (() => void);
}

export class Session {
  private synchronizer: Synchronizer<WorldData>;
  private handlers?: void | BaseSessionHandlers;

  constructor(world: World<UserData>, invoker: SyncInvoker<WorldData>, handlers?: void | SessionHandlers) {
    this.synchronizer = new Synchronizer(world, invoker, synchronize, handlers);
    this.handlers = handlers;
  }

  connect(): void {
    this.synchronizer.start();
    const onConnect = this.handlers && this.handlers.onConnect;
    onConnect && onConnect();
  }

  disconnect(): void {
    this.synchronizer.stop();
    const onDisconnect = this.handlers && this.handlers.onDisconnect;
    onDisconnect && onDisconnect();
  }
}
