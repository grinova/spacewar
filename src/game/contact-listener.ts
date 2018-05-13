import {
  Body,
  Contact,
  ContactListener as BaseContactListener,
  World
} from 'classic2d';
import { BodyHandler, UserData } from './synchronizer';

export class ContactListener implements BaseContactListener<UserData> {
  private world: World;
  private onBodyDestroy: void | BodyHandler;

  constructor(world: World, onBodyDestroy?: void | BodyHandler) {
    this.world = world;
    this.onBodyDestroy = onBodyDestroy;
  }

  // NOTE: Во избежание циклических ссылок
  destroy(): void {
    this.world = null;
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
      this.onDestroy(contact.bodyB);
    }
    if (typeA === 'ship' && typeB === 'rocket') {
      this.destroyBodyAndContact(contact.bodyA, contact);
      this.destroyBodyAndContact(contact.bodyB, contact);
      this.onDestroy(contact.bodyA);
      this.onDestroy(contact.bodyB);
    }
  }

  endContact(contact: Contact<UserData>): void {
  }

  preSolve(contact: Contact<UserData>): void {
  }

  private onDestroy(body: Body): void {
    this.onBodyDestroy && this.onBodyDestroy(body);
  }

  private destroyBodyAndContact(body: Body<UserData>, contact: Contact<UserData>): void {
    this.world.destroyBody(body);
    const contactManager = this.world.getContactManager();
    contactManager.destroy(contact);
  }
}
