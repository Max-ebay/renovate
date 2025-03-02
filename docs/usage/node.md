---
title: Node.js Versions
description: Node.js versions support in Renovate
---

# Node.js Versions

Renovate can upgrade the [Node.js](https://nodejs.org/en/) runtime used by your project.
This way you're using the latest bug fixes, performance improvements, security mitigations, etc.

## File Support

Renovate can manage the Node.js version in the following files:

- The [`engines`](https://docs.npmjs.com/files/package.json#engines) field in [`package.json`](https://docs.npmjs.com/files/package.json)
- The [`volta`](https://docs.volta.sh/guide/understanding#managing-your-project) field in [`package.json`](https://docs.npmjs.com/files/package.json)
- The [`.nvmrc`](https://github.com/creationix/nvm#nvmrc) file for the [Node Version Manager](https://github.com/creationix/nvm)
- The [`node_js`](https://docs.travis-ci.com/user/languages/javascript-with-nodejs/#Specifying-Node.js-versions) field in [`.travis.yml`](https://docs.travis-ci.com/user/customizing-the-build/)

## Configuring which version of npm Renovate uses

When `binarySource=docker`, such as in the hosted WhiteSource Renovate App, Renovate will choose and install an `npm` version dynamically.

To control which version or constraint is installed, you should use the `engines.npm` property in your `package.json` file.
Renovate bot will then use that version constraint for npm when it creates a pull request.

For example, if you want to use at least npm `8.1.0` and also allow newer versions of npm in the `8.x` range, you would put this in your `package.json` file:

```json
{
  "engines": {
    "npm": "^8.1.0"
  }
}
```
