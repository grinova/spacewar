import {
  Exit,
  Message,
  Send,
  Spawn
  } from 'actors-ts'
import { ControllerActor } from 'physics-net'
import { ShipController } from '../controller/ship-controller'
import { RocketActorCreatorProps } from '../creators/rocket'

export type ShipMessage =
  (
    { type: 'thrust', amount: number } |
    { type: 'torque', amount: number } |
    { type: 'fire' }
  ) & Message

export class ShipActor
extends ControllerActor<ShipController, ShipMessage> {
  onMessage(message: ShipMessage, _send: Send, spawn: Spawn, _exit: Exit): void {
    const controller = this.getController()
    if (!controller) {
      return
    }
    switch (message.type) {
      case 'thrust':
        controller.setThrust(message.amount)
        break
      case 'torque':
        controller.setTorque(message.amount)
        break
      case 'fire':
        if (controller.canLaunchRocket()) {
          const ship = controller.getBody()
          if (ship && ship.userData) {
            // TODO: Добавить тип для userData
            const shipId = ship.userData.id
            const creator = this.getCreator()
            if (creator) {
              spawn(id => creator.create<RocketActorCreatorProps>(id, 'rocket', { shipId, id }))
            }
          }
        }
        break
    }
  }
}
