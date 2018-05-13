import {
  Body,
  BodyType,
  CircleShape,
  Vec2,
  World
} from 'classic2d';
import { SyncData, UserData } from './synchronizer';
import { SynchronizerHandlers } from './synchronizer';
import { BodyData } from '../serializers/body';
import { ContactData } from '../serializers/contact';
import { WorldData } from '../serializers/world';

function createBody(b: BodyData, world: World<UserData>): Body {
  const inverse = b.userData.type == 'arena';
  const bodyDef = {
    position: new Vec2(b.position.x, b.position.y),
    angle: b.angle,
    linearVelocity: new Vec2(b.linearVelocity.x, b.linearVelocity.y),
    angularVelocity: b.angularVelocity,
    inverse
  };
  const body = world.createBody(bodyDef);
  const type = BodyType[b.type];
  body.type = type;
  const shape = new CircleShape();
  shape.radius = b.radius;
  const density = 1.0;
  const fd = { shape, density };
  const fixtureDef = { shape, density };
  body.setFixture(fixtureDef);
  body.userData = b.userData;
  return body;
}

function findBody(id: string, world: World<UserData>): void | Body {
  const bodies = world.getBodies();
  for (const body of bodies) {
    if (body.userData.id === id) {
      return body;
    }
  }
}

function syncBody(body: Body, b: BodyData): void {
  body.sweep.a = b.angle;
  body.angularVelocity = b.angularVelocity;
  body.linearVelocity.set(b.linearVelocity.x, b.linearVelocity.y);
  body.sweep.c.set(b.position.x, b.position.y);
  body.synchronize();
}

function syncBodies(world: World<UserData>, bodiesData: BodyData[], handlers?: void | SynchronizerHandlers): void {
  const bodies = world.getBodies().slice();
  for (const body of bodies) {
    if (bodiesData.every(b => b.userData.id !== body.userData.id)) {
      world.destroyBody(body);
      handlers && handlers.onBodyDestroy && handlers.onBodyDestroy(body);
    }
  }
  for (const b of bodiesData) {
    const body = bodies.find(body => body.userData.id === b.userData.id)
    if (body) {
      syncBody(body, b);
    } else {
      const body = createBody(b, world);
      handlers && handlers.onBodyCreate && handlers.onBodyCreate(body);
    }
  }
}

function syncContacts(world: World<UserData>, contactsData: ContactData[]): void {
  const contactManager = world.getContactManager();
  const contacts = contactManager.getContacts().slice();
  for (const contact of contacts) {
    const index = contactsData.findIndex(
      c => c.bodyAID === contact.bodyA.userData.id && c.bodyBID === contact.bodyB.userData.id);
    if (index === -1) {
      contactManager.destroy(contact);
    }
  }
  for (const c of contactsData) {
    const contact = contacts.find(
      contact => contact.bodyA.userData.id === c.bodyAID && contact.bodyB.userData.id === c.bodyBID)
    if (contact) {
      contact.flags = c.flags;
    } else {
      const bodyA = findBody(c.bodyAID, world);
      const bodyB = findBody(c.bodyBID, world);
      if (bodyA && bodyB) {
        const contact = contactManager.addPair(bodyA, bodyB);
        contact.flags = c.flags;
      }
    }
  }
}

// TODO: data: WorldData
export function synchronize(world: World<UserData>, data: SyncData<WorldData>, handlers?: void | SynchronizerHandlers): void {
  syncBodies(world, data.data.bodies, handlers);
  syncContacts(world, data.data.contacts);
}
