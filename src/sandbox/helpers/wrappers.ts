const flags: Map<string, boolean> = new Map<string, boolean>();

export type CancelableKeyboardHandler = (event: KeyboardEvent) => boolean;
export type KeyboardHandler = (event: KeyboardEvent) => void;

export function singleShot(
  keyDown: CancelableKeyboardHandler,
  keyUp: CancelableKeyboardHandler,
  ...keys: string[]
): { keyDown: KeyboardHandler, keyUp: KeyboardHandler } {
  return {
    keyDown: function(event: KeyboardEvent) {
      const { key } = event;
      if (keys.indexOf(key) === -1) {
        return;
      }
      if (!flags.get(key) && !keyDown(event)) {
        flags.set(key, true);
      }
    },
    keyUp: function(event: KeyboardEvent) {
      const { key } = event;
      if (keys.indexOf(key) === -1) {
        return;
      }
      if (flags.get(key) && !keyUp(event)) {
        flags.set(key, false);
      }
    }
  };
}
