import { Perm, PermError } from '../src/perm.js';

describe('Perm', () => {
  describe('Basic functionality', () => {
    test('should have correct static methods', () => {
      expect(typeof Perm.check).toBe('function');
      expect(typeof Perm.request).toBe('function');
      expect(typeof Perm.checkAll).toBe('function');
      expect(typeof Perm.requestAll).toBe('function');
      expect(typeof Perm.onChange).toBe('function');
      expect(typeof Perm.offChange).toBe('function');
      expect(typeof Perm.getSupportedFeatures).toBe('function');
    });

    test('should return supported features', () => {
      const features = Perm.getSupportedFeatures();
      expect(Array.isArray(features)).toBe(true);
      expect(features).toContain('geolocation');
      expect(features).toContain('notifications');
      expect(features).toContain('camera');
      expect(features).toContain('microphone');
      expect(features).toContain('clipboard');
      expect(features).toContain('persistent-storage');
    });
  });

  describe('PermError', () => {
    test('should create PermError with code and message', () => {
      const error = new PermError('Test message', 'TEST_CODE');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PermError);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('PermError');
    });
  });

  describe('check method', () => {
    test('should throw error for unknown feature', async () => {
      await expect(Perm.check('unknown')).rejects.toThrow(PermError);
      await expect(Perm.check('unknown')).rejects.toThrow('Unknown feature: unknown');
    });

    test('should use Permissions API when available', async () => {
      const mockPermissionStatus = new PermissionStatus('granted');
      navigator.permissions.query.mockResolvedValue(mockPermissionStatus);

      const result = await Perm.check('geolocation');
      expect(result).toBe('granted');
      expect(navigator.permissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    test('should fallback when Permissions API fails', async () => {
      navigator.permissions.query.mockRejectedValue(new Error('API not supported'));
      
      const result = await Perm.check('geolocation');
      expect(result).toBe('prompt'); // fallback check for geolocation
    });

    test('should return unsupported when feature is not available', async () => {
      navigator.permissions.query.mockRejectedValue(new Error('API not supported'));
      delete navigator.geolocation;
      
      const result = await Perm.check('geolocation');
      expect(result).toBe('unsupported');
    });
  });

  describe('request method', () => {
    test('should throw error for unknown feature', async () => {
      await expect(Perm.request('unknown')).rejects.toThrow(PermError);
    });

    test('should handle geolocation request', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success({ coords: { latitude: 0, longitude: 0 } });
      });

      const result = await Perm.request('geolocation');
      expect(result).toBe('granted');
    });

    test('should handle geolocation denial', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1 }); // PERMISSION_DENIED
      });

      const result = await Perm.request('geolocation');
      expect(result).toBe('denied');
    });

    test('should handle notifications request', async () => {
      global.Notification.requestPermission.mockResolvedValue('granted');

      const result = await Perm.request('notifications');
      expect(result).toBe('granted');
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });

    test('should handle camera request', async () => {
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([
          { stop: jest.fn() }
        ])
      };
      navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const result = await Perm.request('camera');
      expect(result).toBe('granted');
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    });

    test('should handle camera denial', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      navigator.mediaDevices.getUserMedia.mockRejectedValue(error);

      const result = await Perm.request('camera');
      expect(result).toBe('denied');
    });

    test('should handle clipboard request', async () => {
      navigator.clipboard.readText.mockResolvedValue('test');

      const result = await Perm.request('clipboard');
      expect(result).toBe('granted');
    });

    test('should handle persistent storage request', async () => {
      navigator.storage.persist.mockResolvedValue(true);

      const result = await Perm.request('persistent-storage');
      expect(result).toBe('granted');
    });
  });

  describe('batch operations', () => {
    test('should check multiple features', async () => {
      const mockPermissionStatus = new PermissionStatus('granted');
      navigator.permissions.query.mockResolvedValue(mockPermissionStatus);

      const result = await Perm.checkAll(['geolocation', 'notifications']);
      expect(result).toEqual({
        geolocation: 'granted',
        notifications: 'granted'
      });
    });

    test('should request multiple features', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success({ coords: { latitude: 0, longitude: 0 } });
      });
      global.Notification.requestPermission.mockResolvedValue('granted');

      const result = await Perm.requestAll(['geolocation', 'notifications']);
      expect(result).toEqual({
        geolocation: 'granted',
        notifications: 'granted'
      });
    });

    test('should handle errors in batch operations gracefully', async () => {
      const result = await Perm.checkAll(['geolocation', 'unknown']);
      expect(result.geolocation).toBeDefined();
      expect(result.unknown).toBe('unsupported');
    });
  });

  describe('change events', () => {
    test('should add change listener', () => {
      const handler = jest.fn();
      expect(() => Perm.onChange('geolocation', handler)).not.toThrow();
    });

    test('should remove change listener', () => {
      const handler = jest.fn();
      Perm.onChange('geolocation', handler);
      expect(() => Perm.offChange('geolocation', handler)).not.toThrow();
    });

    test('should throw error for unknown feature in onChange', () => {
      const handler = jest.fn();
      expect(() => Perm.onChange('unknown', handler)).toThrow(PermError);
    });

    test('should throw error for invalid handler', () => {
      expect(() => Perm.onChange('geolocation', 'not a function')).toThrow(PermError);
    });

    test('should call handler when permission status changes', async () => {
      const mockPermissionStatus = new PermissionStatus('prompt');
      navigator.permissions.query.mockResolvedValue(mockPermissionStatus);

      const handler = jest.fn();
      Perm.onChange('geolocation', handler);

      // Trigger check to setup listener
      await Perm.check('geolocation');

      // Simulate permission change
      mockPermissionStatus._triggerChange('granted');

      expect(handler).toHaveBeenCalledWith('granted');
    });
  });

  describe('error handling', () => {
    test('should handle missing browser APIs', async () => {
      delete global.Notification;
      
      const result = await Perm.check('notifications');
      expect(result).toBe('unsupported');
    });

    test('should handle feature request failures', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 2 }); // POSITION_UNAVAILABLE
      });

      await expect(Perm.request('geolocation')).rejects.toThrow(PermError);
    });

    test('should handle no Permissions API gracefully', async () => {
      delete navigator.permissions;
      
      const result = await Perm.check('geolocation');
      expect(result).toBe('prompt'); // Should use fallback
    });
  });

  describe('cross-browser compatibility', () => {
    test('should work without modern APIs', async () => {
      // Remove modern APIs
      delete navigator.permissions;
      delete navigator.mediaDevices;
      delete navigator.clipboard;
      delete navigator.storage;

      const result = await Perm.check('geolocation');
      expect(['prompt', 'unsupported']).toContain(result);
    });

    test('should normalize different status formats', async () => {
      const mockPermissionStatus = new PermissionStatus('allowed'); // Non-standard status
      navigator.permissions.query.mockResolvedValue(mockPermissionStatus);

      const result = await Perm.check('geolocation');
      expect(result).toBe('unsupported'); // Should normalize to standard status
    });
  });
}); 