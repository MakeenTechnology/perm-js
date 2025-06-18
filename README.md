# Perm - Tiny Cross-Browser Permissions Wrapper

<p align="center">
  <strong>Unified API for all browser permissions with automatic fallbacks and change events</strong>
</p>

<p align="center">
  <a href="https://github.com/makeentechnology/perm-js"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="version"></a>
  <a href="https://github.com/makeentechnology/perm-js"><img src="https://img.shields.io/badge/bundle%20size-<5KB-brightgreen.svg" alt="bundle size"></a>
  <a href="https://github.com/makeentechnology/perm-js/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"></a>
  <a href="#"><img src="https://img.shields.io/badge/npm-coming%20soon-orange.svg" alt="npm status"></a>
</p>

**Perm** is a zero-dependency JavaScript library that unifies all modern browser permission APIs (geolocation, notifications, camera/mic, clipboard, persistent storage, etc.) under one simple, promise-based interface. It provides automatic fallbacks for older browsers and real-time permission change events.


## Support the Project

If you’d like to support my work, you can donate via PayPal:

[❤️ Donate via PayPal](https://paypal.me/AlharthyDev)

## ✨ Features

- **🎯 Unified API** - One consistent interface for all permission types
- **🔄 Promise-based** - Modern async/await support
- **📱 Cross-browser** - Works in all modern browsers with automatic fallbacks
- **⚡ Lightweight** - < 5KB minified and gzipped
- **🔔 Change Events** - Real-time permission status updates
- **📦 Zero Dependencies** - No external dependencies
- **💪 TypeScript** - Full TypeScript support with type definitions
- **🎨 Batch Operations** - Check or request multiple permissions at once

## 🚀 Quick Start

### Installation

#### Option 1: NPM (Coming Soon)
```bash
# Package will be published to npm soon
npm install perm-js
```

#### Option 2: Direct Download
Download the latest release from GitHub and include in your project:
```html
<!-- ES Module -->
<script type="module">
  import { Perm } from './dist/perm.esm.min.js';
</script>

<!-- UMD -->
<script src="./dist/perm.umd.min.js"></script>
```

#### Option 3: Clone Repository
```bash
git clone https://github.com/makeentechnology/perm-js.git
cd perm-js
npm install
npm run build
```

### Basic Usage

```javascript
import { Perm } from 'perm-js';

// Check permission status
const status = await Perm.check('geolocation');
console.log(status); // 'granted', 'denied', 'prompt', or 'unsupported'

// Request permission
try {
  const result = await Perm.request('notifications');
  if (result === 'granted') {
    console.log('Notifications enabled!');
  }
} catch (error) {
  console.error('Permission request failed:', error);
}

// Check multiple permissions
const results = await Perm.checkAll(['camera', 'microphone']);
console.log(results); // { camera: 'granted', microphone: 'prompt' }

// Listen for permission changes
Perm.onChange('geolocation', (newStatus) => {
  console.log('Geolocation permission changed to:', newStatus);
});
```

## 📋 Supported Permissions

| Permission | Description | Browser Support |
|------------|-------------|-----------------|
| `geolocation` | Access to device location | All modern browsers |
| `notifications` | Show browser notifications | All modern browsers |
| `camera` | Access to camera/video | Chrome, Firefox, Safari |
| `microphone` | Access to microphone/audio | Chrome, Firefox, Safari |
| `clipboard` | Read from clipboard | Chrome, Firefox, Safari |
| `persistent-storage` | Persistent storage quota | Chrome, Firefox |

## 📚 API Reference

### `Perm.check(feature)`

Check the current permission status for a feature.

```javascript
const status = await Perm.check('geolocation');
// Returns: 'granted' | 'denied' | 'prompt' | 'unsupported'
```

### `Perm.request(feature)`

Request permission for a feature. This will show the browser's permission prompt.

```javascript
const result = await Perm.request('notifications');
// Returns: 'granted' | 'denied' | 'unsupported'
```

### `Perm.checkAll(features)`

Check permission status for multiple features in parallel.

```javascript
const results = await Perm.checkAll(['camera', 'microphone', 'geolocation']);
// Returns: { camera: 'granted', microphone: 'prompt', geolocation: 'denied' }
```

### `Perm.requestAll(features)`

Request permissions for multiple features in parallel.

```javascript
const results = await Perm.requestAll(['camera', 'microphone']);
// Returns: { camera: 'granted', microphone: 'denied' }
```

### `Perm.onChange(feature, handler)`

Listen for permission status changes.

```javascript
const handler = (newStatus) => {
  console.log('Permission changed:', newStatus);
};

Perm.onChange('geolocation', handler);
```

### `Perm.offChange(feature, handler)`

Remove a permission change listener.

```javascript
Perm.offChange('geolocation', handler);
```

### `Perm.getSupportedFeatures()`

Get a list of all supported permission features.

```javascript
const features = Perm.getSupportedFeatures();
// Returns: ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard', 'persistent-storage']
```

## 🎯 Advanced Usage

### Handling Errors

```javascript
import { Perm, PermError } from 'perm-js';

try {
  await Perm.request('camera');
} catch (error) {
  if (error instanceof PermError) {
    switch (error.code) {
      case 'UNKNOWN_FEATURE':
        console.error('Feature not supported');
        break;
      case 'NOT_SUPPORTED':
        console.error('Browser does not support this feature');
        break;
      case 'REQUEST_FAILED':
        console.error('Permission request failed');
        break;
    }
  }
}
```

### Conditional Feature Detection

```javascript
// Check if a feature is supported before using it
const features = Perm.getSupportedFeatures();

if (features.includes('camera')) {
  const cameraStatus = await Perm.check('camera');
  if (cameraStatus === 'granted') {
    // Use camera
  } else if (cameraStatus === 'prompt') {
    // Request camera permission
    await Perm.request('camera');
  }
}
```

### Building a Permission Dashboard

```javascript
async function createPermissionDashboard() {
  const features = Perm.getSupportedFeatures();
  const statuses = await Perm.checkAll(features);
  
  features.forEach(feature => {
    const status = statuses[feature];
    const element = document.getElementById(`${feature}-status`);
    element.textContent = status;
    element.className = `permission-${status}`;
    
    // Listen for changes
    Perm.onChange(feature, (newStatus) => {
      element.textContent = newStatus;
      element.className = `permission-${newStatus}`;
    });
  });
}
```

## 🔧 Browser Support

- **Chrome** 88+
- **Firefox** 85+
- **Safari** 14+
- **Edge** 88+

### Fallback Behavior

For older browsers or unsupported features, Perm provides graceful fallbacks:

- Uses feature detection to determine browser capabilities
- Falls back to feature-specific APIs when Permissions API is unavailable
- Returns `'unsupported'` for truly unavailable features
- Change events are no-ops in unsupported environments

## 📦 Bundle Formats

Perm is available in multiple formats:

- **ES Module**: `dist/perm.esm.js`
- **UMD**: `dist/perm.umd.js`
- **Minified ES Module**: `dist/perm.esm.min.js`
- **Minified UMD**: `dist/perm.umd.min.js`

### Using via CDN (After NPM Publishing)

```html
<!-- ES Module (Will be available after NPM publishing) -->
<script type="module">
  import { Perm } from 'https://unpkg.com/perm-js/dist/perm.esm.min.js';
  
  const status = await Perm.check('geolocation');
  console.log(status);
</script>

<!-- UMD (Will be available after NPM publishing) -->
<script src="https://unpkg.com/perm-js/dist/perm.umd.min.js"></script>
<script>
  Perm.check('geolocation').then(status => {
    console.log(status);
  });
</script>
```

### Current Usage (Before NPM Publishing)

```html
<!-- Clone the repository and use local files -->
<script type="module">
  import { Perm } from './dist/perm.esm.min.js';
  
  const status = await Perm.check('geolocation');
  console.log(status);
</script>
```

## 📦 Publishing to NPM

To publish this package to NPM:

1. **Update package.json** with your npm username in the name field
2. **Create NPM account** at [npmjs.com](https://www.npmjs.com/)
3. **Login to NPM**: `npm login`
4. **Publish**: `npm publish`

After publishing, update the README badges and installation instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for a unified permissions API
- Built with modern web standards in mind
- Thanks to all contributors and users

---

<p align="center">
  Made with ❤️ by the Perm team
</p> 
