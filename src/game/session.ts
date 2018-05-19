import { WorldData } from 'serializers/world';
import { Synchronizer } from './synchronizer';

 export interface SessionHandlers {
  onConnect?: void | (() => void);
  onDisconnect?: void | (() => void);
}

export class Session {
  private synchronizer: Synchronizer;
  private handlers?: void | SessionHandlers;

  constructor(synchronizer: Synchronizer, handlers?: void | SessionHandlers) {
    this.synchronizer = synchronizer;
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
