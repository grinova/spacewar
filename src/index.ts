import { appendDomElement, hide, show } from './common/dom'
import { singleShot } from './sandbox/helpers/wrappers'
import { SpaceWar } from './spacewar'

const MOUNT_POINT_ID = 'mount-point'
const LOGIN_FORM_ID = 'login-form'
const PLAYER_NAME_ID = 'player-name'

function createWebSocket(): WebSocket {
  const url = new URL(window.location.href)
  url.protocol = "ws"
  url.port = "3000"
  url.pathname = "ws"
  return new WebSocket(url.href)
}

function game(_player: string): void {
  const { element: canvas, remove } = appendDomElement('canvas', document.getElementById(MOUNT_POINT_ID))
  document.body.style.overflow = 'hidden'
  document.body.style.margin = '0px'
  const ws = createWebSocket()
  const actions = {
    disconnect: () => {
      spacewar.stop()
      remove()
      login()
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }
  const spacewar = new SpaceWar({ actions, canvas, ws, width: window.innerWidth, height: window.innerHeight })

  const resize = () => {
    spacewar.resize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resize)

  const { keyDown, keyUp } = singleShot(
    (event: KeyboardEvent) => spacewar.keyDown(event),
    (event: KeyboardEvent) => spacewar.keyUp(event),
    'w', 'a', 's', 'd', ' ', 'r', 'Escape'
  )
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)

  spacewar.run()
}

function login(player?: string): void {
  if (player) {
    game(player)
  } else {
    show(LOGIN_FORM_ID)
    const element = <HTMLInputElement>document.getElementById(PLAYER_NAME_ID)
    element.onkeydown = function(event: KeyboardEvent) {
      if (event.keyCode == 13) {
        const player = element.value
        hide(LOGIN_FORM_ID)
        game(player)
      }
    }
    element.focus()
  }
}

window.onload = function(): void {
  const url = new URL(window.location.href)
  const player = url.searchParams.get('player')
  login(player)
}
