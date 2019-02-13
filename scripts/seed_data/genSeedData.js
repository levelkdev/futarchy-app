const fs = require('fs')
const path = require('path')

const seedDataDir = path.resolve(__dirname, 'data');
const nextFileName = getNextFileName()

const HOUR = 60 * 60
const DAY = HOUR * 24

const timeIncrement = DAY * 3

const decisionResolutionPeriod = DAY * 7
const priceResolutionPeriod = decisionResolutionPeriod * 2

const numRandomBuysPerIncrement = 3

let decisions = [
  {
    time: 0,
    question: 'Execute a transfer of 1,000 ETH to 0xa1b2c3...?'
  },
  {
    time: DAY * 1,
    question: 'Increase the minimum funding parameter to 45 TKN?'
  },
  {
    time: DAY * 8,
    question: 'Change the timeframe for future futarchy decisions to 30 days?'
  },
  {
    time: DAY * 9,
    question: 'Approve AGP proposal number 7...?'
  },
  {
    time: DAY * 12,
    question: 'Reject XRP from registry?'
  },
  {
    time: DAY * 13,
    question: 'Approve inclusion of centralized front end?'
  }
]

const startTime = 0
const endTime = DAY * 15

let time = startTime

let data = []

while(time < endTime) {
  for (let i in decisions) {
    const decision = decisions[i]
    if (decision.time <= time && !decision.added) {
      decision.added = true
      data.push(decisionData(decision.question))
    }
    if (time - priceResolutionPeriod < decision.time &&
        time > decision.time)
    {
      data = addRandomBuys(data, parseInt(i))
    }
  }
  time += timeIncrement
  data.push(advanceTimeData(timeIncrement))
}

const prettyData = JSON.stringify(data, null, 2)

fs.writeFileSync(`${seedDataDir}/${nextFileName}`, prettyData, 'utf8');

function advanceTimeData (seconds) {
  return {
    type: 'advanceTime',
    seconds
  }
}

function addRandomBuys (data, decisionId) {
  for(let i = 0; i < numRandomBuysPerIncrement; i++) {
    data.push(randomBuyData(decisionId))
  }
  return data
}

function randomBuyData(decisionId) {
  return {
    type: 'buy',
    decisionId,
    from: randomAccount(),
    tokenAmount: randomTokenValue(),
    yesPrediction: randomPosition(),
    noPrediction: randomPosition()
  }
}

function randomPosition () {
  return ['SHORT', 'LONG'][getRandomInt(0,1)]
}

function randomTokenValue () {
  return getRandomInt(0.1 * 10 ** 18, 10 * 10 ** 18)
}

function randomAccount() {
  return getRandomInt(0, 9)
}

function decisionData(question) {
  return {
    type: 'newDecision',
    executionScript: '',
    metadata: question
  }
}

function getNextFileName() {
  const items = fs.readdirSync(seedDataDir)
  let nextIdx = 0
  if (items.length > 0) {
    for(let i in items) {
      const fileName = items[i]
      if (fileName.indexOf('data_') >= 0 && fileName.indexOf('.json') >=0) {
        let idx = parseInt(fileName.replace('data_', '').replace('.json', ''))
        if (idx > nextIdx) nextIdx = idx
      }
    }
    nextIdx = nextIdx + 1
  }
  return `data_${nextIdx}.json`
}

function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
