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

export interface ModBundle {
  modName: string
  csproj: string
  exportFolder: string,
  scripts: Script[]
}

export interface PackageData {
  iconUrl: string
  manifest: string
  readme: string
  dllPath: string
  destination: string
}

const modApi = {
  selectFolder: (dialogTitle: string): Promise<string> => ipcRenderer.invoke('modApi:selectFolder', dialogTitle),
  showFile: (path: string) => ipcRenderer.invoke('modApi:showFile', path),
  getAssemblies: (libFolderPath: string): Promise<{path: string; name: string; }[]> => ipcRenderer.invoke('modApi:getAssemblies', libFolderPath),
  exportMod: (bundle: ModBundle): Promise<{status: string; binary: string | undefined; message: string | undefined; output: string}> => ipcRenderer.invoke('modApi:exportMod', bundle),
  exportPackage: (packageData: PackageData): Promise<string> => ipcRenderer.invoke('modApi:exportPackage', packageData),
  minimize: () => ipcRenderer.invoke('application:minimize'),
  maximize: () => ipcRenderer.invoke('application:maximize'),
  exit: () => ipcRenderer.invoke('application:exit')
}
contextBridge.exposeInMainWorld('modApi', modApi);
export type ModdingApi = typeof modApi;
