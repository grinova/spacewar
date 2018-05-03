import {
  Body,
  BodyDef,
  BodyType,
  CircleShape,
  Rot,
  Vec2,
  World
} from 'classic2d';
import { IDS } from '../../game/consts';
import { ObjectType, UserData } from '../../game/synchronizer';

export function resetWorld(world: World): void {
  world.clear();
  createBodies(world);
}

interface BodyOptions extends Partial<BodyDef> {
  radius: number;
  density?: number;
  isStatic?: boolean;
}

function createBody(
  userData: UserData,
  world: World<UserData>,
  {
    radius,
    density = 1,
    isStatic = false,
    position = new Vec2(),
    angle = 0,
    linearVelocity = new Vec2(),
    angularVelocity = 0,
    inverse = false
  }: BodyOptions
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

function createArena(world: World<UserData>): Body<UserData> {
  return createBody({ id: IDS.ARENA, type: 'arena' }, world, { radius: 1, isStatic: true, inverse: true });
}

function createBlackHole(world: World<UserData>): Body<UserData> {
  return createBody({ id: IDS.BLACK_HOLE, type: 'black-hole' }, world, { radius: 0.125, isStatic: true });
}

function createShip(world: World<UserData>, id: string, type: ObjectType, bodyOptions: BodyOptions): Body<UserData> {
  return createBody({ id, type }, world, bodyOptions);
}

function createBodies(world: World): void {
  const ARENA_RADIUS = 1;
  const SHIP_RADIUS = 0.05;
  const OFFSET_RADIUS = 0.6;
  const arena = createArena(world);
  const blackHole = createBlackHole(world);
  const shipA = createShip(
    world,
    IDS.SHIP_A,
    'ship-a',
    { radius: SHIP_RADIUS, position: new Vec2(-OFFSET_RADIUS, -OFFSET_RADIUS), angle: 0 });
  const shipB = createShip(
    world,
    IDS.SHIP_B,
    'ship-b',
    { radius: SHIP_RADIUS, position: new Vec2(OFFSET_RADIUS, OFFSET_RADIUS), angle: Math.PI });
}
