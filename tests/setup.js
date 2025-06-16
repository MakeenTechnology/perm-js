// Mock browser APIs for testing
global.navigator = {
  permissions: {
    query: jest.fn()
  },
  geolocation: {
    getCurrentPosition: jest.fn()
  },
  mediaDevices: {
    getUserMedia: jest.fn()
  },
  clipboard: {
    readText: jest.fn()
  },
  storage: {
    persist: jest.fn()
  }
};

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default'
};

// Mock PermissionStatus
global.PermissionStatus = class PermissionStatus {
  constructor(state) {
    this.state = state;
    this.onchange = null;
    this._listeners = [];
  }

  addEventListener(event, listener) {
    if (event === 'change') {
      this._listeners.push(listener);
    }
  }

  removeEventListener(event, listener) {
    if (event === 'change') {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    }
  }

  _triggerChange(newState) {
    this.state = newState;
    this._listeners.forEach(listener => listener());
    if (this.onchange) {
      this.onchange();
    }
  }
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset navigator.permissions
  global.navigator.permissions.query.mockReset();
  
  // Reset geolocation
  global.navigator.geolocation.getCurrentPosition.mockReset();
  
  // Reset media devices
  global.navigator.mediaDevices.getUserMedia.mockReset();
  
  // Reset clipboard
  global.navigator.clipboard.readText.mockReset();
  
  // Reset storage
  global.navigator.storage.persist.mockReset();
  
  // Reset Notification
  global.Notification.requestPermission.mockReset();
  global.Notification.permission = 'default';
}); 