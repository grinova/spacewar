import { UserData as NetUserData } from 'physics-net'

export interface UserData extends NetUserData {
  type: string
}
