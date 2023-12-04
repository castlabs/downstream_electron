export interface IDownstreamElectronAPI {
    init: (window: BrowserWindow, peristance: any?= null) => any,
}

declare global {
    interface Window {
        downstreamElectronAPI: IDownstreamElectronAPI
    }
}