import { TimeDelta, Vec2 } from 'classic2d'
import { BaseController } from 'physics-net'
import { UserData } from '../data/user-data'

export class RocketController
extends BaseController<UserData> {
  private static readonly FORCE = 1

  step(_time: TimeDelta): void {
    const force = new Vec2(0, RocketController.FORCE).rotate(this.body.getRot())
    this.body.applyForce(force)
  }
}
