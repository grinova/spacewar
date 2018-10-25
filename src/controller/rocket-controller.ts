import { TimeDelta, Vec2 } from 'classic2d'
import { BaseController } from 'physics-net'

export class RocketController
extends BaseController {
  private static readonly FORCE = 1

  step(_time: TimeDelta): void {
    const force = new Vec2(0, RocketController.FORCE).rotate(this.body.getRot())
    this.body.applyForce(force)
  }
}
