// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};
contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;

interface Script {
  name: string
  content: string
}

interface ModBundle {
  modName: string
  csproj: string
  exportFolder: string,
  scripts: Script[]
}

const modApi = {
  selectFolder: (dialogTitle: string) => ipcRenderer.invoke('modApi:selectFolder', dialogTitle),
  getAssemblies: (libFolderPath: string) => ipcRenderer.invoke('modApi:getAssemblies', libFolderPath),
  exportMod: (bundle: ModBundle) => ipcRenderer.invoke('modApi:exportMod', bundle)
}
contextBridge.exposeInMainWorld('modApi', modApi);
export type ModdingApi = typeof modApi;

export type { ModBundle };
