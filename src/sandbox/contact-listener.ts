import { Contact, ContactListener as BaseContactListener, World } from 'classic2d';
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
    if (!this.world) {
      return;
    }
    if (contact.bodyA.userData.type === 'arena') {
      this.world.destroyBody(contact.bodyB);
      const contactManager = this.world.getContactManager();
      contactManager.destroy(contact);
    }
    if (contact.bodyB.userData.type === 'arena') {
      this.world.destroyBody(contact.bodyA);
      const contactManager = this.world.getContactManager();
      contactManager.destroy(contact);
    }
  }

  endContact(contact: Contact<UserData>): void {

  }

  preSolve(contact: Contact<UserData>): void {

  }
}
