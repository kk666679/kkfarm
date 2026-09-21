/**
 * DevicesList component
 * Demonstrates end-to-end REST usage for devices domain.
 * Devices are external/public-facing and must use REST (/api/v1/devices).
 */
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function DevicesList() {
  const [tenantId] = useState('default-tenant'); // Would come from auth context
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommanding, setIsCommanding] = useState(false);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const res = await api.devices.list({ tenantId });
      setDevices(res.devices);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [tenantId]);

  const handleCreateDevice = async () => {
    try {
      setIsCreating(true);
      const res = await api.devices.create({ tenantId, name: 'New Device', provider: 'adb' });
      setDevices(prev => [...prev, res.device]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      setIsDeleting(true);
      await api.devices.remove(deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRebootDevice = async (deviceId: string) => {
    try {
      setIsCommanding(true);
      const res = await api.devices.restart(deviceId);
      setDevices(prev => prev.map(d => (d.id === deviceId ? res.device : d)));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsCommanding(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading devices...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Devices</h1>
        <button
          onClick={handleCreateDevice}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Add Device'}
        </button>
      </div>

      {isCreating && <div className="p-2 bg-blue-100 rounded">Creating device...</div>}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">Error: {(error as any)?.message}</div>
      )}

      <div className="space-y-2">
        {devices && devices.length > 0 ? (
          devices.map(device => (
            <div key={device.id} className="p-4 border rounded-lg space-y-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className="text-sm text-gray-600">ID: {device.id}</p>
                  <p className="text-sm">
                    Status:{' '}
                    <span
                      className={
                        device.status === 'online'
                          ? 'text-green-600'
                          : device.status === 'offline'
                            ? 'text-gray-600'
                            : 'text-red-600'
                      }
                    >
                      {device.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">Provider: {device.provider}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleRebootDevice(device.id)}
                    disabled={isCommanding}
                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
                  >
                    Reboot
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-600">No devices found</div>
        )}
      </div>
    </div>
  );
}
