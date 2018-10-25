# Changelog

This project is following [Semantic Versioning](http://semver.org)

## [Unreleased][]

## [0.2.10][] - 2018-08-21

### Changed

 - use the new apps structure, and various ux improvements
 - use @deskpro/apps-sdk@0.8.0
 - use @deskpro/apps-components@0.8.3

## [0.2.9][] - 2018-03-29

### Added

    - travis will atttach builds to Github PR's when enabled via s3 environment variables
    - adds @deskpro/redux-components

### Changed

    - upgrade to @deskpro/apps-sdk-react version 0.2.13
    - upgrade to @deskpro/apps-dpat version 0.10.40

## [0.2.8][] - 2018-02-09

 - default `process.env.NODE_ENV` to `production` when packaging the app for distribution with webpack  

## [0.2.7][] - 2017-12-14

### Changed 
 - style changes

## [0.2.7-beta.3][] - 2017-12-14

### Fixed 
 - remove semantic-ui styles which caused style and scroll issues
 - style changes

## [0.2.7-beta.2][] - 2017-12-13

### Fixed 
 - remove hardcoded container widths 

### Changed 

 - upgrade to @deskpro/apps-sdk-react version 0.2.4
 - upgrade to @deskpro/react-components version 1.2.4 

## [0.2.7-beta.1][] - 2017-12-13

### Changed
 - use latest version of apps-sdk-react

### Fixed 
 - duplicate cards created by repeatedly pressing the create card button 


## [0.2.6][] - 2017-11-24

### Added

 - error message when app fails to initialize
 - upgrade to to @deskpro/apps-dpat v0.9.5 

### Changed
 - update dependencies
 - using ticket custom fields to store trello cards
 
## [0.2.5][] - 2017-08-31

### Fixed 
 - unable to share linked cards due to incorrect access settings in manifest
 
## [0.2.4][] - 2017-08-22

QA passed

## [0.2.4-beta.5][] - 2017-08-16

### Changed
 - update dependencies
 - starting project changelog
 
### Fixed 
 - missing url property of newly created card prevents visiting card on Trello
 - badge count not updated after card was deleted on Trello



[Unreleased]: https://github.com/DeskproApps/trello/compare/v0.2.10...HEAD
[0.2.10]: https://github.com/DeskproApps/trello/compare/v0.1.1...v0.2.10
[0.1.1]: https://github.com/DeskproApps/trello/compare/v0.2.9...v0.1.1
[0.2.9]: https://github.com/DeskproApps/trello/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/DeskproApps/trello/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/DeskproApps/trello/compare/v0.2.7-beta.3...v0.2.7
[0.2.7-beta.3]: https://github.com/DeskproApps/trello/compare/v0.2.7-beta.2...v0.2.7-beta.3
[0.2.7-beta.2]: https://github.com/DeskproApps/trello/compare/v0.2.7-beta.1...v0.2.7-beta.2
[0.2.7-beta.1]: https://github.com/DeskproApps/trello/compare/v0.2.6...v0.2.7-beta.1
[0.2.6]: https://github.com/DeskproApps/trello/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/DeskproApps/trello/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/DeskproApps/trello/compare/v0.2.4-beta.5...v0.2.4
[0.2.4-beta.5]: https://github.com/DeskproApps/trello/tree/v0.2.4-beta.5
