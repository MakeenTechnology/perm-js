/**
 * PermError - Custom error class for permission-related errors
 */
class PermError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'PermError';
    this.code = code;
  }
}

/**
 * Feature definitions for different permission types
 */
const FEATURES = {
  geolocation: {
    queryName: 'geolocation',
    request: async () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new PermError('Geolocation not supported', 'NOT_SUPPORTED'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve('denied');
            } else {
              reject(new PermError('Geolocation request failed', 'REQUEST_FAILED'));
            }
          },
          { timeout: 10000 }
        );
      });
    },
    fallbackCheck: () => {
      return navigator.geolocation ? 'prompt' : 'unsupported';
    }
  },

  notifications: {
    queryName: 'notifications',
    request: async () => {
      if (!('Notification' in window)) {
        throw new PermError('Notifications not supported', 'NOT_SUPPORTED');
      }
      
      const permission = await Notification.requestPermission();
      return permission === 'granted' ? 'granted' : 'denied';
    },
    fallbackCheck: () => {
      if (!('Notification' in window)) return 'unsupported';
      return Notification.permission === 'granted' ? 'granted' : 
             Notification.permission === 'denied' ? 'denied' : 'prompt';
    }
  },

  camera: {
    queryName: 'camera',
    request: async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new PermError('Camera not supported', 'NOT_SUPPORTED');
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        return 'granted';
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          return 'denied';
        }
        throw new PermError('Camera request failed', 'REQUEST_FAILED');
      }
    },
    fallbackCheck: () => {
      return navigator.mediaDevices?.getUserMedia ? 'prompt' : 'unsupported';
    }
  },

  microphone: {
    queryName: 'microphone',
    request: async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new PermError('Microphone not supported', 'NOT_SUPPORTED');
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        return 'granted';
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          return 'denied';
        }
        throw new PermError('Microphone request failed', 'REQUEST_FAILED');
      }
    },
    fallbackCheck: () => {
      return navigator.mediaDevices?.getUserMedia ? 'prompt' : 'unsupported';
    }
  },

  clipboard: {
    queryName: 'clipboard-read',
    request: async () => {
      if (!navigator.clipboard?.readText) {
        throw new PermError('Clipboard not supported', 'NOT_SUPPORTED');
      }
      
      try {
        await navigator.clipboard.readText();
        return 'granted';
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          return 'denied';
        }
        throw new PermError('Clipboard request failed', 'REQUEST_FAILED');
      }
    },
    fallbackCheck: () => {
      return navigator.clipboard?.readText ? 'prompt' : 'unsupported';
    }
  },

  'persistent-storage': {
    queryName: 'persistent-storage',
    request: async () => {
      if (!navigator.storage?.persist) {
        throw new PermError('Persistent storage not supported', 'NOT_SUPPORTED');
      }
      
      try {
        const granted = await navigator.storage.persist();
        return granted ? 'granted' : 'denied';
      } catch (error) {
        throw new PermError('Persistent storage request failed', 'REQUEST_FAILED');
      }
    },
    fallbackCheck: () => {
      return navigator.storage?.persist ? 'prompt' : 'unsupported';
    }
  }
};

/**
 * Change event handlers storage
 */
const changeHandlers = new Map();

/**
 * Permission status cache
 */
const statusCache = new Map();

/**
 * Check if navigator.permissions API is available
 */
function hasPermissionsAPI() {
  return 'permissions' in navigator && 'query' in navigator.permissions;
}

/**
 * Normalize permission status
 */
function normalizeStatus(status) {
  if (typeof status === 'string') {
    return ['granted', 'denied', 'prompt', 'unsupported'].includes(status) ? status : 'unsupported';
  }
  return 'unsupported';
}

/**
 * Setup change listener for a permission
 */
function setupChangeListener(feature, permissionStatus) {
  if (!permissionStatus || typeof permissionStatus.addEventListener !== 'function') {
    return;
  }

  const handler = () => {
    const newStatus = normalizeStatus(permissionStatus.state);
    statusCache.set(feature, newStatus);
    
    const handlers = changeHandlers.get(feature);
    if (handlers) {
      handlers.forEach(callback => {
        try {
          callback(newStatus);
        } catch (error) {
          console.error('Error in permission change handler:', error);
        }
      });
    }
  };

  permissionStatus.addEventListener('change', handler);
  return handler;
}

/**
 * Main Perm class
 */
class Perm {
  /**
   * Check permission status for a feature
   * @param {string} feature - The feature to check
   * @returns {Promise<'granted'|'denied'|'prompt'|'unsupported'>}
   */
  static async check(feature) {
    if (!FEATURES[feature]) {
      throw new PermError(`Unknown feature: ${feature}`, 'UNKNOWN_FEATURE');
    }

    const featureConfig = FEATURES[feature];

    // Try using the Permissions API first
    if (hasPermissionsAPI()) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: featureConfig.queryName });
        const status = normalizeStatus(permissionStatus.state);
        statusCache.set(feature, status);
        
        // Setup change listener if not already done
        if (!changeHandlers.has(feature + '_listener')) {
          const listener = setupChangeListener(feature, permissionStatus);
          if (listener) {
            changeHandlers.set(feature + '_listener', listener);
          }
        }
        
        return status;
      } catch (error) {
        // Fall back to feature-specific check
        console.warn(`Permissions API failed for ${feature}:`, error);
      }
    }

    // Use fallback check
    if (featureConfig.fallbackCheck) {
      const status = normalizeStatus(featureConfig.fallbackCheck());
      statusCache.set(feature, status);
      return status;
    }

    return 'unsupported';
  }

  /**
   * Request permission for a feature
   * @param {string} feature - The feature to request
   * @returns {Promise<'granted'|'denied'|'unsupported'>}
   */
  static async request(feature) {
    if (!FEATURES[feature]) {
      throw new PermError(`Unknown feature: ${feature}`, 'UNKNOWN_FEATURE');
    }

    const featureConfig = FEATURES[feature];

    try {
      const status = await featureConfig.request();
      const normalizedStatus = normalizeStatus(status);
      statusCache.set(feature, normalizedStatus);
      
      // Trigger change handlers
      const handlers = changeHandlers.get(feature);
      if (handlers) {
        handlers.forEach(callback => {
          try {
            callback(normalizedStatus);
          } catch (error) {
            console.error('Error in permission change handler:', error);
          }
        });
      }
      
      return normalizedStatus;
    } catch (error) {
      if (error instanceof PermError) {
        throw error;
      }
      throw new PermError(`Request failed for ${feature}: ${error.message}`, 'REQUEST_FAILED');
    }
  }

  /**
   * Check permissions for multiple features
   * @param {string[]} features - Array of features to check
   * @returns {Promise<Record<string, 'granted'|'denied'|'prompt'|'unsupported'>>}
   */
  static async checkAll(features) {
    const results = {};
    const promises = features.map(async (feature) => {
      try {
        results[feature] = await this.check(feature);
      } catch (error) {
        results[feature] = 'unsupported';
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Request permissions for multiple features
   * @param {string[]} features - Array of features to request
   * @returns {Promise<Record<string, 'granted'|'denied'|'unsupported'>>}
   */
  static async requestAll(features) {
    const results = {};
    const promises = features.map(async (feature) => {
      try {
        results[feature] = await this.request(feature);
      } catch (error) {
        results[feature] = 'unsupported';
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Add change listener for a feature
   * @param {string} feature - The feature to listen to
   * @param {Function} handler - The change handler function
   */
  static onChange(feature, handler) {
    if (!FEATURES[feature]) {
      throw new PermError(`Unknown feature: ${feature}`, 'UNKNOWN_FEATURE');
    }

    if (typeof handler !== 'function') {
      throw new PermError('Handler must be a function', 'INVALID_HANDLER');
    }

    if (!changeHandlers.has(feature)) {
      changeHandlers.set(feature, new Set());
    }

    changeHandlers.get(feature).add(handler);

    // Try to setup native change listener if we haven't already
    this.check(feature).catch(() => {
      // Ignore errors, we're just trying to setup the listener
    });
  }

  /**
   * Remove change listener for a feature
   * @param {string} feature - The feature to stop listening to
   * @param {Function} handler - The handler function to remove
   */
  static offChange(feature, handler) {
    if (!FEATURES[feature]) {
      throw new PermError(`Unknown feature: ${feature}`, 'UNKNOWN_FEATURE');
    }

    const handlers = changeHandlers.get(feature);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        changeHandlers.delete(feature);
      }
    }
  }

  /**
   * Get list of supported features
   * @returns {string[]}
   */
  static getSupportedFeatures() {
    return Object.keys(FEATURES);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Perm, PermError };
} else if (typeof define === 'function' && define.amd) {
  define(() => ({ Perm, PermError }));
} else if (typeof window !== 'undefined') {
  window.Perm = Perm;
  window.PermError = PermError;
}

export { Perm, PermError }; 