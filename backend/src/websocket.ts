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
    const securityListener=(payload:unknown)=>socket.send(JSON.stringify({event:'security.score.updated',payload}));
    const monitoringListener=(payload:unknown)=>socket.send(JSON.stringify({event:'monitoring.snapshot',version:1,payload}));
    const diagnosticsListener=(payload:unknown)=>socket.send(JSON.stringify({event:'diagnostics.run.progress',version:1,payload}));

    const errorListener = (error: Error) => {
      socket.send(JSON.stringify({ event: 'error', payload: { message: 'Router polling failed', category: /session/i.test(error.message) ? 'session' : 'connectivity' } }));
    };

    pollingService.on('snapshot', snapshotListener);
    pollingService.on('deviceConnected', deviceConnectedListener);
    pollingService.on('deviceDisconnected', deviceDisconnectedListener);
    for(const event of ['device-ip-changed','device-hostname-changed','device-roamed'])pollingService.on(event,intelligenceListener);
    pollingService.on('security.score.updated',securityListener);
    pollingService.on('monitoring.snapshot',monitoringListener);
    for(const event of ['diagnostics.run.started','diagnostics.run.completed','diagnostics.run.failed'])pollingService.on(event,diagnosticsListener);
    pollingService.on('error', errorListener);

    socket.on('close', () => {
      pollingService.off('snapshot', snapshotListener);
      pollingService.off('deviceConnected', deviceConnectedListener);
      pollingService.off('deviceDisconnected', deviceDisconnectedListener);
      for(const event of ['device-ip-changed','device-hostname-changed','device-roamed'])pollingService.off(event,intelligenceListener);
      pollingService.off('security.score.updated',securityListener);
      pollingService.off('monitoring.snapshot',monitoringListener);
      for(const event of ['diagnostics.run.started','diagnostics.run.completed','diagnostics.run.failed'])pollingService.off(event,diagnosticsListener);
      pollingService.off('error', errorListener);
    });
  });
};
