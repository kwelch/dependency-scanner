#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var flags = {
  none: 0,
  production: 1 << 0,
  dev: 1 << 1,
  peer: 1 << 2,
  optional: 1 << 3,
  bundled: 1 << 4,
};
var VERBOSE = false;
var SILENT = false;
var DEBUG = false;
var INCLUDE_FLAGS = Object.keys(flags).reduce(function (acc, curr) {
  return acc + flags[curr];
}, 0);

function logMessage(message) {
  // don't log not truthy values, or in silent
  if (!message || SILENT) {
    return;
  }
  console.log(message);
}

function displayDependencies(deps) {
  deps.sort().forEach(function (item) {
    console.log(item.name);
  })
}

function appendDependencies(arr, deps, depType) {
  return (arr || {}).concat(Object.keys(deps).map(function (key) {
    return { name: key, version: deps[key], depType };
  }));
}

function loadDependencies(path) {
  return fs.stat(path, function (err, stat) {
    if (err == null && stat.isFile()) {
      var pkg = require(packagePath);
      var deps = [];

      if (INCLUDE_FLAGS & flags.production && pkg.dependencies) {
        logMessage(VERBOSE && 'loading production dependencies');
        deps = appendDependencies(deps, pkg.dependencies, 'production');
      }

      if (INCLUDE_FLAGS & flags.dev && pkg.devDependencies) {
        logMessage(VERBOSE && 'loading dev dependencies');
        deps = appendDependencies(deps, pkg.devDependencies, 'dev');
      }

      if (INCLUDE_FLAGS & flags.peer && pkg.peerDependencies) {
        logMessage(VERBOSE && 'loading peer dependencies');
        deps = appendDependencies(deps, pkg.peerDependencies, 'peer');
      }

      if (INCLUDE_FLAGS & flags.bundled) {
        if (pkg.bundledDependencies) {
          logMessage(VERBOSE && 'loading bundled dependencies');
          deps = appendDependencies(deps, pkg.bundledDependencies, 'bundled');
        }

        if (pkg.bundleDependencies) {
          logMessage(VERBOSE && 'loading bundle dependencies');
          deps = appendDependencies(deps, pkg.bundleDependencies, 'bundled');
        }
      }

      if (INCLUDE_FLAGS & flags.optional && pkg.optionalDependencies) {
        logMessage(VERBOSE && 'loading optional dependencies');
        deps = appendDependencies(deps, pkg.optionalDependencies, 'optional');
      }

      displayDependencies(deps);
    } else if (err.code == 'ENOENT') {
      logMessage(chalk.red("Must be call from within a node package directory."));
      logMessage(chalk.bold.blue("Failed to find `package.json`."));
      process.exit(1);
    } else {
      logMessage(chalk.red("Must be call from within a node package directory."));
      logMessage(DEBUG && 'Some other error: ', err.code);
      process.exit(1);
    }
  });
}

var packagePath = path.resolve('package.json');
loadDependencies(packagePath);