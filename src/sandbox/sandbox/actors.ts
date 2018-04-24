import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Rot,
  Vec2,
  World
} from 'classic2d';

export enum IdKind {
  Arena,
  Object
}

const DEFAULT_IDS = {
  [IdKind.Arena]: 'arena',
  [IdKind.Object]: 'object-'
};

function createBody(
  userData: any,
  world: World,
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

function createArena(world: World, radius: number): Body {
  return createBody({ id: DEFAULT_IDS[IdKind.Arena] }, world, radius, 1000, new Vec2(), 0, new Vec2(), 0, true, true);
}

function createActors(world: World, count: number, arenaRadius: number): void {
  const ACTOR_RADIUS = 0.1;
  const ACTORS_COUNT = 20;
  for (let i = 0; i < ACTORS_COUNT; i++) {
    const position = new Vec2(rand(arenaRadius - 2 * ACTOR_RADIUS), 0)
      .rotate(new Rot().setAngle(rand(2 * Math.PI)));
    const linearVelocity = new Vec2(rand(1, 0)).rotate(new Rot().setAngle(rand(2 * Math.PI)));
    createBody({ id: DEFAULT_IDS[IdKind.Object] + i }, world, ACTOR_RADIUS, 1, position, 0, linearVelocity, 0);
  }
}

function createBodies(world: World): void {
  const ARENA_RADIUS = 3;
  const arena = createArena(world, ARENA_RADIUS);
  createActors(world, 20, ARENA_RADIUS);
}

export function resetWorld(world: World): void {
  world.clear();
  createBodies(world);
}
