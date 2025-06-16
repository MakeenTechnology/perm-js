# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of Perm library
- Support for geolocation, notifications, camera, microphone, clipboard, and persistent-storage permissions
- Cross-browser compatibility with automatic fallbacks
- TypeScript definitions
- Comprehensive test suite
- Promise-based API
- Change event listeners
- Batch operations for multiple permissions
- Custom PermError class with error codes

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Perm - Tiny Cross-Browser Permissions Wrapper
- Core API methods: `check()`, `request()`, `checkAll()`, `requestAll()`
- Event system with `onChange()` and `offChange()` methods
- Support for 6 permission types: geolocation, notifications, camera, microphone, clipboard, persistent-storage
- Zero dependencies
- ES Module and UMD builds
- TypeScript support
- Comprehensive documentation
- Unit tests with >90% coverage
- Automatic fallbacks for older browsers
- Error handling with custom PermError class 