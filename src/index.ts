import { World } from 'classic2d'
import { WebSocketNet } from 'physics-net'
import {
  appendDomElement,
  hide,
  show
} from './common/dom'
import { StateMachine } from './common/state-machine'
import { UserData } from './data/user-data'
import { Client } from './game/client'
import {
  Signal,
  State,
  states
} from './game/game-states'
import { UserShipController } from './game/user-ship-controller'
import { KeyboardHandler, singleShot } from './sandbox/helpers/wrappers'
import { SpaceWar } from './spacewar'

const MOUNT_POINT_ID = 'mount-point'
const LOGIN_FORM_ID = 'login-form'
const PLAYER_NAME_ID = 'player-name'
const WAITING_SCREEN_ID = 'waiting-screen'

function createWebSocket(): WebSocket {
  const url = new URL(window.location.href)
  url.protocol = 'ws'
  url.port = '3000'
  url.pathname = 'ws'
  url.searchParams.forEach((_, key) => url.searchParams.delete(key))
  return new WebSocket(url.href)
}

class GameMachine {
  private mountingPointElement: HTMLElement
  private loginElement: HTMLElement
  private playerInput: HTMLInputElement
  private watingScreenElement: HTMLElement
  private removeCanvasElement: () => void

  private machine: StateMachine
  private playerName: string

  private ws: WebSocket
  private world: World<UserData>
  private client: Client
  private userShipController: UserShipController
  private spacewar: SpaceWar

  constructor(player?: string) {
    this.mountingPointElement = document.getElementById(MOUNT_POINT_ID)
    this.loginElement = document.getElementById(LOGIN_FORM_ID)
    this.playerInput = <HTMLInputElement>document.getElementById(PLAYER_NAME_ID)
    this.watingScreenElement = document.getElementById(WAITING_SCREEN_ID)
    const { keyDown, keyUp } = singleShot(
      (event: KeyboardEvent) => this.spacewar.keyDown(event),
      (event: KeyboardEvent) => this.spacewar.keyUp(event),
      'w', 'a', 's', 'd', ' ', 'r', 'Escape'
    )
    this.handleKeyDown = keyDown
    this.handleKeyUp = keyUp

    const callbacks = {
      [State.Login]: { enter: this.handleEnderLogin, leave: this.handleLeaveLogin },
      [State.Waiting]: { enter: this.handleEnterWaiting, leave: this.handleLeaveWaiting },
      [State.Game]: { enter: this.handleEnterGame, leave: this.handleLeaveGame },
      [State.Final]: { enter: this.handleEnterFinal, leave: this.handleLeaveFinal },
    }
    this.playerName = player
    this.machine = new StateMachine(states, callbacks, this.playerName ? State.Waiting : State.Login)
  }

  private handleEnderLogin = (): void => {
    show(this.loginElement)
    this.playerInput.addEventListener('keydown', this.handleKeyDownPlayerInput)
    this.playerInput.focus()
  }

  private handleLeaveLogin = (): void => {
    hide(this.loginElement)
    this.playerInput.removeEventListener('keydown', this.handleKeyDownPlayerInput)
  }

  private handleEnterWaiting = (): void => {
    show(this.watingScreenElement)
    this.ws = createWebSocket()
    this.world = new World<UserData>()
    const net = new WebSocketNet(this.ws)
    const listener = {
      onConnect: this.handleConnect,
      onUserName: this.handleUserName,
      onOpponentJoin: this.handleOpponentJoin,
      onOpponentLeave: this.handleOpponentLeave,
    }
    this.client = new Client(net, this.world, listener)
    this.client.onError = this.handleError
    this.client.onDisconnect = this.handleDisconnect
  }

  private handleLeaveWaiting = (): void => {
    hide(this.watingScreenElement)
  }

  private handleEnterGame = (): void => {
    const { element: canvas, remove } = appendDomElement('canvas', this.mountingPointElement)
    this.removeCanvasElement = remove
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0px'
    const actions = {
      disconnect: () => {
        this.machine.sig(Signal.PlayerLeave)
      }
    }
    const { world, client, userShipController } = this
    const { innerWidth: width, innerHeight: height } = window
    const options = { actions, canvas, world, client, userShipController }
    this.spacewar = new SpaceWar(options, width, height)
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.spacewar.run()
  }

  private handleLeaveGame = (): void => {
    this.spacewar.stop()
    this.ws.close()
    this.removeCanvasElement()
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
  }

  private handleEnterFinal = (): void => {
  }

  private handleLeaveFinal = (): void => {
  }

  private handleConnect = (): void => {
    const systemSender = this.client.getSystemSender()
    systemSender.send({ type: 'player-name', data: this.playerName })
  }

  private handleDisconnect = (): void => {
    this.machine.sig(Signal.PlayerLeave)
  }

  private handleError = (): void => {
    this.machine.sig(Signal.PlayerConnErr)
  }

  private handleUserName = (userName: string): void => {
    this.userShipController = new UserShipController(userName, this.client.getEventSender())
  }

  private handleOpponentJoin = (_opponentName: string): void => {
    this.machine.sig(Signal.OpponentJoin)
  }

  private handleOpponentLeave = (_opponentName: string): void => {
    this.machine.sig(Signal.OpponentLeave)
  }

  private handleKeyDownPlayerInput = (event: KeyboardEvent) => {
    if (event.keyCode == 13) {
      this.playerName = this.playerInput.value
      this.machine.sig(Signal.Enter)
    }
  }

  private handleResize = () => {
    this.spacewar.resize(window.innerWidth, window.innerHeight)
  }

  private handleKeyDown: KeyboardHandler
  private handleKeyUp: KeyboardHandler
}

window.onload = function (): void {
  const url = new URL(window.location.href)
  const player = url.searchParams.get('player')
  new GameMachine(player)
}
