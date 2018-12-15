# Futarchy App

App for futarchy

## Setup

1. `npm install`

2. `npm run compile`

## Run

1. `npm run start:app`: builds the frontend to `dist/`

2. `npm run devchain`: starts a local aragon [devchain](https://hack.aragon.org/docs/cli-usage.html#aragon-devchain)

3. `npm run start:aragon`:
  * deploys contract dependencies
  * publishes the futarchy app
  * creates a new futarchy DAO instance
  * starts the aragon app

## Scripts

### `npm run devchain:reset`

Starts the devchain with `--reset`, which deletes existing ganache snapshots

**NOTE: aragon caches event data using indexdb. You need to clear your browser cache after the devchain is reset
