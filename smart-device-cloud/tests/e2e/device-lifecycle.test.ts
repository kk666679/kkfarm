import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEmulatorManager } from '../../packages/android-emulator/src/index';
import { InMemoryRemotePhoneManager } from '../../packages/remote-phone/src/index';

describe('device lifecycle e2e', () => {
  let emulatorManager: InMemoryEmulatorManager;
  let remoteManager: InMemoryRemotePhoneManager;

  beforeEach(() => {
    emulatorManager = new InMemoryEmulatorManager();
    remoteManager = new InMemoryRemotePhoneManager();
  });

  it('creates profile, starts emulator, opens remote session, closes session', async () => {
    const profile = emulatorManager.createProfile({
      name: 'Pixel 7',
      androidVersion: '14',
      apiLevel: 34,
      ramMb: 4096,
      storageMb: 8192,
    });
    expect(profile.id).toBeDefined();

    const instance = await emulatorManager.start(profile.id);
    expect(instance.state).toBe('running');

    const session = remoteManager.createSession({
      deviceId: instance.id,
      userId: 'user-1',
      permissions: ['screen', 'input'],
    });
    expect(session.active).toBe(true);

    remoteManager.closeSession(session.id);
    expect(remoteManager.getSession(session.id)?.active).toBe(false);

    await emulatorManager.stop(instance.id);
    expect(emulatorManager['instances'].get(instance.id)?.state).toBe('stopped');
  });
});
