import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Rot,
  Vec2,
  World
} from 'classic2d';
import { UserData } from '../../game/synchronizer';

export enum IdKind {
  Arena,
  Object
}

const DEFAULT_IDS = {
  [IdKind.Arena]: 'arena',
  [IdKind.Object]: 'object-'
};

function createBody(
  userData: UserData,
  world: World<UserData>,
  radius: number,
  density: number,
  position: Vec2,
  angle: number,
  linearVelocity: Vec2,
  angularVelocity: number,
  isStatic: boolean = false,
  inverse: boolean = false
): Body {
  const shape = new CircleShape();
  shape.radius = radius;
  const fd = { shape, density };

  const bd: BodyDef = { position, angle, linearVelocity, angularVelocity, inverse };
  const body = world.createBody(bd);
  if (isStatic) {
    body.type = BodyType.static;
  }

  body.setFixture(fd);
  body.userData = userData;
  return body;
}

function rand(max: number, min: number = 0): number {
  return Math.random() * (max - min) + min;
}

function createArena(world: World<UserData>, radius: number): Body<UserData> {
  return createBody({ id: DEFAULT_IDS[IdKind.Arena], type: 'arena' }, world, radius, 1000, new Vec2(), 0, new Vec2(), 0, true, true);
}

function createActors(world: World, count: number, arenaRadius: number): void {
  const ACTOR_RADIUS = 0.1;
  const bodies: Body[] = [];
  for (let i = 0; i < count; i++) {
    const position = findEmptyPlace(ACTOR_RADIUS, arenaRadius, bodies);
    if (!position) {
      return;
    }
    const linearVelocity = new Vec2(rand(1, 0)).rotate(new Rot().setAngle(rand(2 * Math.PI)));
    bodies.push(
      createBody({ id: DEFAULT_IDS[IdKind.Object] + i, type: 'ship' }, world, ACTOR_RADIUS, 1, position, 0, linearVelocity, 0));
  }
}

function createBodies(world: World): void {
  const ARENA_RADIUS = 3;
  const ACTORS_COUNT = 20;
  const arena = createArena(world, ARENA_RADIUS);
  createActors(world, ACTORS_COUNT, ARENA_RADIUS);
}

function findEmptyPlace(radius: number, arenaRadius: number, bodies: Body[], iterations: number = 20): void | Vec2 {
  const maxEmptyRadius = arenaRadius - 2 * radius;
  for (let i = 0; i < iterations; i++) {
    const position = new Vec2(rand(maxEmptyRadius), 0).rotate(new Rot().setAngle(rand(2 * Math.PI)));
    if (bodies.every(body => {
      const p = body.getPosition();
      const r = body.getRadius();
      const d = Math.sqrt(p.sub(position).length());
      return d > radius + r;
    })) {
      return position;
    }
  }
}

export function resetWorld(world: World): void {
  world.clear();
  createBodies(world);
}
