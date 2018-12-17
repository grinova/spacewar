import { Handler } from 'physics-net'

export interface SystemHandlerListener {
  onUserName(userName: string): void
  onOpponentJoin(opponentName: string): void
  onOpponentLeave(opponentName: string): void
  onScore(playerName: string, amount: number): void
}

export type SystemMessage =
  { type: 'user-name', data: string } |
  { type: 'opponent-join', data: string } |
  { type: 'opponent-leave', data: string } |
  { type: 'score', data: { playerName: string, amount: number } }

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
      case 'score':
        this.listener.onScore(message.data.playerName, message.data.amount)
        break
    }
  }
}
