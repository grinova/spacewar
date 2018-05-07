import {
  Body,
  Contact,
  ContactListener as BaseContactListener,
  World
} from 'classic2d';
import { UserData } from '../game/synchronizer';

export class ContactListener extends BaseContactListener<UserData> {
  private world: World;

  constructor(world: World) {
    super();
    this.world = world;
  }

  // NOTE: Во избежание циклических ссылок
  destroy(): void {
    this.world = undefined;
  }

  beginContact(contact: Contact<UserData>): void {
    const { userData: userDataA } = contact.bodyA;
    const { userData: userDataB } = contact.bodyB;
    const { type: typeA } = userDataA;
    const { type: typeB } = userDataB;
    if (
      typeA === 'arena' && typeB === 'rocket' ||
      typeA === 'black-hole' && (typeB === 'rocket' || typeB === 'ship')
    ) {
      this.destroyBodyAndContact(contact.bodyB, contact);
    }
    if (typeA === 'ship' && typeB === 'rocket') {
      this.destroyBodyAndContact(contact.bodyA, contact);
      this.destroyBodyAndContact(contact.bodyB, contact);
    }
  }

  endContact(contact: Contact<UserData>): void {
  }

  preSolve(contact: Contact<UserData>): void {
  }

  private destroyBodyAndContact(body: Body<UserData>, contact: Contact<UserData>): void {
    this.world.destroyBody(body);
    const contactManager = this.world.getContactManager();
    contactManager.destroy(contact);
  }
}
