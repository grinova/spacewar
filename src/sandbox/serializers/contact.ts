import { Contact, ContactFlags } from 'classic2d';
import { ContactData } from '../../serializers/contact';

function serializeContactFlags(type: ContactFlags): number {
  return type;
}

export function serializeContact(contact: Contact): ContactData {
  const { bodyA, bodyB, flags: f } = contact;
  const bodyAID = bodyA.userData['id'] as string;
  const bodyBID = bodyB.userData['id'] as string;
  const flags = serializeContactFlags(f);
  return {
    bodyAID,
    bodyBID,
    flags
  };
}
