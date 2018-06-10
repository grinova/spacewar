import { ControllerActor, ControllerActorProps } from 'physics-net'
import { RocketController } from '../controller/rocket-controller'
import { UserData } from '../data/user-data'

export interface RocketActorProps
extends ControllerActorProps<UserData, RocketController> {}

export class RocketActor
extends ControllerActor<UserData, RocketController> {
}
