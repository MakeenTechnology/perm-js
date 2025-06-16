/**
 * Permission status types
 */
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Supported permission features
 */
export type PermissionFeature = 
  | 'geolocation'
  | 'notifications'
  | 'camera'
  | 'microphone'
  | 'clipboard'
  | 'persistent-storage';

/**
 * Permission change handler function type
 */
export type PermissionChangeHandler = (newStatus: PermissionStatus) => void;

/**
 * Error codes for PermError
 */
export type PermErrorCode = 
  | 'UNKNOWN_FEATURE'
  | 'REQUEST_FAILED'
  | 'NOT_SUPPORTED'
  | 'INVALID_HANDLER';

/**
 * Custom error class for permission-related errors
 */
export declare class PermError extends Error {
  readonly code: PermErrorCode;
  
  constructor(message: string, code: PermErrorCode);
}

/**
 * Main Perm class for cross-browser permission management
 */
export declare class Perm {
  /**
   * Check permission status for a feature
   * @param feature - The feature to check
   * @returns Promise resolving to permission status
   * @throws {PermError} When feature is unknown
   */
  static check(feature: PermissionFeature): Promise<PermissionStatus>;

  /**
   * Request permission for a feature
   * @param feature - The feature to request
   * @returns Promise resolving to permission status (excludes 'prompt')
   * @throws {PermError} When feature is unknown or request fails
   */
  static request(feature: PermissionFeature): Promise<Exclude<PermissionStatus, 'prompt'>>;

  /**
   * Check permissions for multiple features
   * @param features - Array of features to check
   * @returns Promise resolving to feature-status map
   */
  static checkAll(features: PermissionFeature[]): Promise<Record<PermissionFeature, PermissionStatus>>;

  /**
   * Request permissions for multiple features
   * @param features - Array of features to request
   * @returns Promise resolving to feature-status map (excludes 'prompt' statuses)
   */
  static requestAll(features: PermissionFeature[]): Promise<Record<PermissionFeature, Exclude<PermissionStatus, 'prompt'>>>;

  /**
   * Add change listener for a feature
   * @param feature - The feature to listen to
   * @param handler - The change handler function
   * @throws {PermError} When feature is unknown or handler is invalid
   */
  static onChange(feature: PermissionFeature, handler: PermissionChangeHandler): void;

  /**
   * Remove change listener for a feature
   * @param feature - The feature to stop listening to
   * @param handler - The handler function to remove
   * @throws {PermError} When feature is unknown
   */
  static offChange(feature: PermissionFeature, handler: PermissionChangeHandler): void;

  /**
   * Get list of supported features
   * @returns Array of supported feature names
   */
  static getSupportedFeatures(): PermissionFeature[];
}

/**
 * Default export for convenience
 */
export default Perm; 