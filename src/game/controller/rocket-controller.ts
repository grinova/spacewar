import { Body, Vec2 } from 'classic2d';
import { Controller } from './controller';
import { UserData } from '../synchronizer';

export type Rocket = Body<UserData>;

export class RocketController implements Controller {
  private static readonly FORCE = 1;

  private rocket: Rocket;
  private owner: string;

  constructor(rocket: Rocket, owner: string) {
    this.rocket = rocket;
    this.owner = owner;
  }

  getId(): string {
    return this.rocket.userData.id;
  }

  step(): void {
    const force = new Vec2(0, RocketController.FORCE).rotate(this.rocket.getRot());
    this.rocket.applyForce(force)
  }
}
