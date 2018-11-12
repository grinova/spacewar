import { EventSender } from 'physics-net'
import { ShipMessage } from '../actors/ship-actor'

export class UserShipController {
  private userShipId: string
  private sender: EventSender

  constructor(userShipId: string, sender: EventSender) {
    this.userShipId = userShipId
    this.sender = sender
  }

  thrust(amount: number): void {
    const { userShipId: id } = this
    this.sender.send<ShipMessage>({ id, data: { type: 'thrust', amount } })
  }

  torque(amount: number): void {
    const { userShipId: id } = this
    this.sender.send<ShipMessage>({ id, data: { type: 'torque', amount } })
  }

  fire(): void {
    const { userShipId: id } = this
    this.sender.send<ShipMessage>({ id, data: { type: 'fire' } })
  }
}
