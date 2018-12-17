import { Handler } from 'physics-net'

export interface SystemHandlerListener {
  onUserName(userName: string): void
  onOpponentJoin(opponentName: string): void
  onOpponentLeave(opponentName: string): void
}

export type SystemMessage =
  { type: 'user-name', data: string } |
  { type: 'opponent-join', data: string } |
  { type: 'opponent-leave', data: string }

export class SystemHandler
implements Handler<SystemMessage> {
  private listener: SystemHandlerListener

  constructor(listener: SystemHandlerListener) {
    this.listener = listener
  }

  handle(message: SystemMessage): void {
    switch (message.type) {
      case 'user-name':
        this.listener.onUserName(message.data)
        break
      case 'opponent-join':
        this.listener.onOpponentJoin(message.data)
        break
      case 'opponent-leave':
        this.listener.onOpponentLeave(message.data)
        break
    }
  }
}
