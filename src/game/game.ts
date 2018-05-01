import { World } from 'classic2d';
import { WorldData } from 'serializers/world';
import { Session } from './session';
import { SyncInvoker, UserData } from './synchronizer';

export class Game {
  private session: void | Session;
  private userWorld: World<UserData>;
  private invoker: SyncInvoker<WorldData>;

  constructor(userWorld: World<UserData>, invoker: SyncInvoker<WorldData>) {
    this.userWorld = userWorld;
    this.invoker = invoker;
  }

  closeSession(): void {
    if (this.session) {
      this.session.disconnect();
      this.session = undefined;
    }
  }

  getSession(): Session {
    if (!this.session) {
      this.session = new Session(this.userWorld, this.invoker);
      this.session.connect();
    }
    return this.session;
  }
}