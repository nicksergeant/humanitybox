# epixa-resource
[![Build Status](https://travis-ci.org/epixa/epixa-resource.png)](https://travis-ci.org/epixa/epixa-resource)
[![Coverage Status](https://coveralls.io/repos/epixa/epixa-resource/badge.png?branch=master)](https://coveralls.io/r/epixa/epixa-resource?branch=master)

An angular.js module for mapping http requests to/from defined model objects.

## Setting up for development

If you wish to modify or run tests against this module, you'll need to install
all dependencies. You can do this via `npm`:

```
npm install
```

This will first install all of the node modules we rely on for testing and will
then automatically run `bower install` to setup our client-side dependencies.
Other than for troubleshooting, you should not need to call bower directly.

## Running tests

Once all dependencies are installed, you can run the tests via `npm` as well:

```
npm test
```

This will run the unit tests once against Firefox using the local karma module.
If you want to pass custom arguments, you can do so by running the tests via
karma manually.  For example, if you have already installed karma globally, you
can run the following command to start up the karma runner, run the unit tests,
and then automatically re-run the tests whenever the tests or source files
change:

```
karma start test/config.js --singleRun=false
```
