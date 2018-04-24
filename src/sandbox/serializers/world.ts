import { World } from 'classic2d';
import { serializeBody } from './body';
import { serializeContact } from './contact';
import { WorldData } from '../../serializers/world';

export function serializeWorld(world: World): WorldData {
  const bodies = world.getBodies().map(serializeBody);
  const contactManager = world.getContactManager();
  const contacts = contactManager.getContacts().map(serializeContact);
  return {
    bodies,
    contacts
  };
}
