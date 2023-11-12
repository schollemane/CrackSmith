import { ElectronHandler, ModdingApi } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    modApi: ModdingApi
  }
}

export {};
