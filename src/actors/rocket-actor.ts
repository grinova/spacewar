import { ControllerActor, ControllerActorProps } from 'physics-net'
import { RocketController } from '../controller/rocket-controller'

export interface RocketActorProps
extends ControllerActorProps<RocketController> {}

export class RocketActor
extends ControllerActor<RocketController> {
}
