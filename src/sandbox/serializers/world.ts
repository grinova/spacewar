import { World } from 'classic2d';
import { serializeBody } from './body';
import { serializeContact } from './contact';
import { UserData } from '../../game/synchronizer';
import { WorldData } from '../../serializers/world';

export function serializeWorld(world: World<UserData>): WorldData {
  const bodies = world.getBodies().map(serializeBody);
  const contactManager = world.getContactManager();
  const contacts = contactManager.getContacts().map(serializeContact);
  return {
    bodies,
    contacts
  };
}
