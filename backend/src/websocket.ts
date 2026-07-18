import type { WebSocketServer } from 'ws';
import type { PollingService } from './polling.js';
import type { RouterSnapshot } from './types.js';

export const attachWebsocket = (wss: WebSocketServer, pollingService: PollingService) => {
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ event: 'connected', message: 'Socket ready' }));

    const snapshotListener = (snapshot: RouterSnapshot) => {
      socket.send(JSON.stringify({ event: 'snapshot', payload: snapshot }));
    };

    const deviceConnectedListener = (snapshot: RouterSnapshot, deviceId: string) => {
      socket.send(JSON.stringify({ event: 'device-connected', payload: { snapshot, deviceId } }));
    };

    const deviceDisconnectedListener = (snapshot: RouterSnapshot, deviceId: string) => {
      socket.send(JSON.stringify({ event: 'device-disconnected', payload: { snapshot, deviceId } }));
    };
    const intelligenceListener=(payload:unknown)=>socket.send(JSON.stringify({event:'device-updated',payload}));

    const errorListener = (error: Error) => {
      socket.send(JSON.stringify({ event: 'error', payload: { message: 'Router polling failed', category: /session/i.test(error.message) ? 'session' : 'connectivity' } }));
    };

    pollingService.on('snapshot', snapshotListener);
    pollingService.on('deviceConnected', deviceConnectedListener);
    pollingService.on('deviceDisconnected', deviceDisconnectedListener);
    for(const event of ['device-ip-changed','device-hostname-changed','device-roamed'])pollingService.on(event,intelligenceListener);
    pollingService.on('error', errorListener);

    socket.on('close', () => {
      pollingService.off('snapshot', snapshotListener);
      pollingService.off('deviceConnected', deviceConnectedListener);
      pollingService.off('deviceDisconnected', deviceDisconnectedListener);
      for(const event of ['device-ip-changed','device-hostname-changed','device-roamed'])pollingService.off(event,intelligenceListener);
      pollingService.off('error', errorListener);
    });
  });
};
