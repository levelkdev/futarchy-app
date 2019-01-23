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

### Seeding data

Seeding scripts in `scripts/seed_data` can be used to seed the UI with decisions and market trades.

To run the scripts, first run through the "Run" instructions above. Make sure all processes have succeeded and are running. Then:

1. Copy the DAO address from the URL of the app. This can be found in the `npm run start:aragon` output:

```
Open DAO [completed]
 ℹ You are now ready to open your app in Aragon.

 ℹ This is the configuration for your development deployment:
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: 0x5b48408a77645bd31e5eBaa460E84B588eaae1d4

    Opening http://localhost:3000/#/0x5b48408a77645bd31e5eBaa460E84B588eaae1d4 to view your DAO
```

2. Run `npm run seed <DAO_ADDRESS>`. Replace `<DAO_ADDRESS>` with your copied address

When these succeed, you will see 3 decisions in the UI. If you click on the first decision, you will see a series of trades.

To run a specific seed file, use `npm run seed <DAO_ADDRESS> [DATA_FILE_ID]`. The file ID can be found in the file name `scripts/data/data_<DATA_FILE_ID>.json`. If no ID is specified, the seed script defaults to running with the `scripts/data/data_0.json` file.

### `npm run devchain:reset`

Starts the devchain with `--reset`, which deletes existing ganache snapshots

**NOTE: aragon caches event data using indexdb. You need to clear your browser cache after the devchain is reset

## Sandbox Setup (for Component UI development)

Use this to develop components without having to depend on the "backend" smart contract environment:

1. First, `npm install`

2. Run `npm run start:app` to build the frontend to the `dist` dir and watch for changes.

3. Run `npm run start:sandbox` to serve the frontend at `http://localhost:8080`

4. Modify `./app/components/DecisionListEmptyState.js` to add the component you're working on. This is the default view, so you should see changes here when you refresh the browser.

If something breaks, just restart the `npm run start:app` and `npm run start:sandbox` processes.

## Mocking Component State

All components in `futarchy-app` are "stateless functional" components. This means they expect some state as input, and render UI based on this state. You can use hardcoded state to test these components. Here's an example:

```
// ./app/components/DecisionListEmptyState.js

import React from 'react'
// import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'
import DecisionSummary from './DecisionSummary'

const mockDecision = {
  id: 123456,
  question: 'question will show up?'
}

const DecisionListEmptyState = () => (
  <DecisionSummary decision={mockDecision} />
  // <div>
  //   Nothing here yet...
  //   <br /> <br />

  //   <ShowPanelButtonContainer panelName="createDecisionMarket">
  //     New Decision
  //   </ShowPanelButtonContainer>
  // </div>
)

export default DecisionListEmptyState
```

This should display the `DecisionSummary` component with the state that we provided in `mockDecision`.

## Styling

We're using react [styled-components](https://www.styled-components.com/docs/basics), which allow you to add CSS within the component .js files. See `./app/components/AppHeader.js` for a good example of this.
