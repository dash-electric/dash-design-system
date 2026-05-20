// Programmatic API. Useful for embedding dash-build in other tools / tests.

export { showBanner } from "./menu/ascii-banner.js"
export { runInteractiveMenu, type MenuChoice, type MenuOptions } from "./menu/interactive-menu.js"
export { detectPort, isPortFree } from "./menu/port-detect.js"

export { runWebUI, type WebUIOptions } from "./modes/web-ui.js"
export { runTerminalUI, type TerminalUIOptions } from "./modes/terminal-ui.js"
export { runTray, type TrayOptions } from "./modes/tray.js"
export { runExit } from "./modes/exit.js"

export {
  launchDaemon,
  type LaunchDaemonOptions,
  type LaunchedDaemon,
} from "./daemon/launch.js"
export {
  writePidFile,
  readPidFile,
  deletePidFile,
  isProcessAlive,
  PID_FILE_PATH,
} from "./daemon/pid-file.js"
export { waitForHealth, type WaitForHealthOptions } from "./daemon/health.js"

export {
  startDaemon,
  type DaemonServerOptions,
  type RunningDaemon,
} from "./daemon/server.js"
export { Store, STATE_FILE_PATH, type StoreOptions } from "./daemon/state/store.js"
export {
  Broadcaster,
  wrapSocket,
  type WsClient,
} from "./daemon/ws/broadcaster.js"
export {
  type DaemonState,
  type PromptRecord,
  type PromptStatus,
  type AuthState,
  type WorkspaceState,
} from "./daemon/state/types.js"
