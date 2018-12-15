# Futarchy App

App for futarchy

## Setup

1. `npm install`

2. `npm run compile`

## Run

1. `npm run start:app`: builds the frontend to `dist/`

2. `npm run devchain:reset`: starts a local aragon [devchain](https://hack.aragon.org/docs/cli-usage.html#aragon-devchain)

3. `npm run start:aragon`:
  * deploys contract dependencies
  * publishes the futarchy app
  * creates a new futarchy DAO instance
  * starts the aragon app
