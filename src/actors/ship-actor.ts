import {
  Exit,
  Message,
  Send,
  Spawn
  } from 'actors-ts'
import { ControllerActor, ControllerActorProps } from 'physics-net'
import { ShipController } from '../controller/ship-controller'
import { RocketActorCreatorProps } from '../creators/rocket'

export type ShipMessage =
  (
    { type: 'thrust', amount: number } |
    { type: 'torque', amount: number } |
    { type: 'fire' }
  ) & Message

export interface ShipActorProps
extends ControllerActorProps<ShipController> {}

export class ShipActor
extends ControllerActor<ShipController, ShipMessage> {
  onMessage(message: ShipMessage, _send: Send, spawn: Spawn, _exit: Exit): void {
    switch (message.type) {
      case 'thrust':
        this.controller.setThrust(message.amount)
        break
      case 'torque':
        this.controller.setTorque(message.amount)
        break
      case 'fire':
        if (this.controller.canLaunchRocket()) {
          const ship = this.controller.body
          if (ship.userData) {
            const shipId = ship.userData.id
            spawn(id => this.creator.create<RocketActorCreatorProps>(id, 'rocket', { shipId }))
          }
        }
        break
    }
  }
}
