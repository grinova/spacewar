import { BodyData } from './body';
import { ContactData } from './contact';

export interface WorldData {
  bodies: BodyData[];
  contacts: ContactData[];
}
