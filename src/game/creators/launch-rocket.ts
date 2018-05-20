import {
  CircleShape,
  Vec2,
  World
} from 'classic2d';
import { Rocket } from '../controller/rocket-controller';
import { Ship, ShipController } from '../controller/ship-controller';
import { UserData } from '../synchronizer';

export interface RocketProps {
  id: string;
  distance: number;
  velocity: number;
  radius: number;
}

export function launchRocket(
  world: World<UserData>,
  ship: Ship,
  props: RocketProps
): Rocket {
  const position = new Vec2(0, props.distance);
  position.rotate(ship.getRot());
  position.add(ship.getPosition());
  const angle = ship.getAngle();
  const linearVelocity = new Vec2(0, props.velocity);
  linearVelocity.rotate(ship.getRot());
  linearVelocity.add(ship.linearVelocity);
  const angularVelocity = 0;
  const bodyDef = { position, angle, linearVelocity, angularVelocity };
  const rocket = world.createBody(bodyDef);
  rocket.userData = { id: props.id, type: 'rocket', properties: { owner: ship.userData.id } };
  const shape = new CircleShape();
  shape.radius = props.radius;
  const fixtureDef = { shape, density: 1 };
  rocket.setFixture(fixtureDef);
  return rocket;
}
