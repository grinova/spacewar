import {
  Exit,
  Message,
  Send,
  Spawn
  } from 'actors-ts'
import { ControllerActor, ControllerActorProps } from 'physics-net'
import { ShipController } from '../controller/ship-controller'
import { RocketActorCreatorProps } from '../creators/rocket'
import { UserData } from '../data/user-data'

export type ShipMessage =
  (
    { type: 'thrust', amount: number } |
    { type: 'torque', amount: number } |
    { type: 'fire' }
  ) & Message

export interface ShipActorProps
extends ControllerActorProps<UserData, ShipController> {}

export class ShipActor
extends ControllerActor<UserData, ShipController, ShipMessage> {
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
          spawn(this.creator.create<RocketActorCreatorProps<UserData>>('rocket', { bodyProps: { ship } }))
        }
        break
    }
  }
}
