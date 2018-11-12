import { Handler } from 'physics-net'

export interface SystemHandlerListener {
  onUserName(userName: string): void
}

export type SystemMessage = { type: "user-name", data: string }

export class SystemHandler
implements Handler<SystemMessage> {
  private listener: SystemHandlerListener

  constructor(listener: SystemHandlerListener) {
    this.listener = listener
  }

  handle(message: SystemMessage): void {
    if (message.type == "user-name") {
      this.listener.onUserName(message.data)
    }
  }
}
