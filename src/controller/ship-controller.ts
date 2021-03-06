import { TimeDelta, Vec2 } from 'classic2d'
import { BaseController } from 'physics-net'

export class ShipController
extends BaseController {
  private static readonly MAX_FORCE = 0.1
  private static readonly MAX_TORQUE = 5
  private static readonly DUMP_ROTATION_COEF = 0.97

  private thrust: number = 0
  private torque: number = 0

  // TODO: Реализовать задержку между выстрелами
  // private rocketCounter: number = 0
  // private rocketCoolDown: boolean = false
  // private rocketCoolDownTimer: Timer

  canLaunchRocket(): boolean {
    return true
  }

  setTorque(torque: number): void {
    this.torque = torque
  }

  setThrust(thrust: number): void {
    this.thrust = thrust
  }

  step(_time: TimeDelta): void {
    const body = this.getBody()
    if (!body) {
      return
    }
    const force = new Vec2(0, this.thrust)
    force.rotate(body.getRot())
    body.applyForce(force.mul(ShipController.MAX_FORCE))
    body.setTorque(this.torque * ShipController.MAX_TORQUE)
    body.angularVelocity *= ShipController.DUMP_ROTATION_COEF
  }
}
