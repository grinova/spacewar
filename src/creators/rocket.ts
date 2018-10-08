import { Body } from 'classic2d'
import { ActorProps } from 'physics-net'

export interface RocketActorCreatorProps<UserData>
extends ActorProps {
  bodyProps: {
    ship: Body<UserData>
  }
}
