export interface ShipUserData {
  id: string;
  type: 'ship';
}

interface RocketUserData {
  id: string;
  type: 'rocket';
}

interface CommonUserData {
  id: string;
  type: 'arena' | 'black-hole';
}

export type UserData = CommonUserData | ShipUserData | RocketUserData;
