import {
  Body,
  CircleShape,
  Vec2,
  World,
  BodyType
} from 'classic2d';
import { SyncData } from './synchronizer';
import { BodyData } from '../serializers/body';
import { WorldData } from '../serializers/world';

function createBody(b: BodyData, world: World): Body {
  const inverse = b.type == 'arena';
  const bodyDef = {
    position: new Vec2(b.position.x, b.position.y),
    angle: b.angle,
    linearVelocity: new Vec2(b.linearVelocity.x, b.linearVelocity.y),
    angularVelocity: b.angularVelocity,
    inverse
  };
  const body = world.createBody(bodyDef);
  if (inverse) {
    body.type = BodyType.static;
  }
  const shape = new CircleShape();
  shape.radius = b.radius;
  const density = 1.0;
  const fd = { shape, density };
  const fixtureDef = { shape, density };
  body.setFixture(fixtureDef);
  body.userData = { 'id': b.id };
  return body;
}

function syncBody(body: Body, b: BodyData): void {
  body.sweep.a = b.angle;
  body.angularVelocity = b.angularVelocity;
  body.linearVelocity.set(b.linearVelocity.x, b.linearVelocity.y);
  body.sweep.c.set(b.position.x, b.position.y);
  body.synchronize();
}

export function synchronize(world: World, data: SyncData<WorldData>): void {
  const bodies = world.getBodies();
  for (const b of data.data.bodies) {
    let found = false;
    for (const body of bodies) {
      if (b.id === body.userData['id']) {
        syncBody(body, b);
        found = true;
        break;
      }
    }
    if (!found) {
      createBody(b, world);
    }
  }
}
