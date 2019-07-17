const MedianPriceOracle = artifacts.require('MedianPriceOracle')
const TimeMedianDataFeed = artifacts.require('TimeMedianDataFeed')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const unixTime = () => Math.round(new Date().getTime() / 1000)

const RESOLUTION_DATE = unixTime() - (4 * 60 * 60 *24)
const MEDIAN_TIMEFRAME = 60 * 60 * 24

contract('MedianPriceOracle', (accounts) => {
  let medianPriceOracle, medianDatafeed

  beforeEach(async () => {
    medianDataFeed = await TimeMedianDataFeed.new()
    medianDataFeed.initialize(accounts[0])
  })

  describe('constructor()', () => {
    beforeEach(async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )
    })

    it('sets the correct medianDataFeed', async () => {
      expect(await medianPriceOracle.medianDataFeed()).to.equal(medianDataFeed.address)
    })

    it('sets the correct medianTimeframe', async () => {
      expect((await medianPriceOracle.medianTimeframe()).toNumber()).to.equal(MEDIAN_TIMEFRAME)
    })

    it('sets the correct resolutionDate', async () => {
      expect((await medianPriceOracle.resolutionDate()).toNumber()).to.equal(RESOLUTION_DATE)
    })
  })

  describe('setOutcome()', () => {
    let pingInterval

    beforeEach(async () => {
      await populateDataFeed(medianDataFeed)
      pingInterval = MEDIAN_TIMEFRAME / 3
    })

    it('sets the correct outcome for of resolutionDate = RESOLUTION_DATE', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )

      await medianPriceOracle.setOutcome(2, 5)
      expect((await medianPriceOracle.getOutcome()).toNumber()).to.equal(7)
    })

    it('sets the correct outcome if startIndex is 1', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE - pingInterval,
      )

      await medianPriceOracle.setOutcome(1, 4)
      expect((await medianPriceOracle.getOutcome()).toNumber()).to.equal(5)
    })

    it('sets the correct outcome if endIndex is the last date set', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE + pingInterval,
      )

      await medianPriceOracle.setOutcome(3, 6)
      expect((await medianPriceOracle.getOutcome()).toNumber()).to.equal(7)
    })

    it('reverts if the startIndex parameter comes after the correct startIndex', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )

      await assertRevert(async () => {
        await medianPriceOracle.setOutcome(3, 5)
      })
    })

    it('reverts if the startIndex comes before the correct startIndex', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )

      await assertRevert(async () => {
        await medianPriceOracle.setOutcome(1, 5)
      })
    })

    it('reverts if the endIndex comes after the correct endIndex', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )

      await assertRevert(async () => {
        await medianPriceOracle.setOutcome(2, 6)
      })
    })

    it('reverts if the endIndex comes before the correct endIndex', async () => {
      medianPriceOracle = await MedianPriceOracle.new(
        medianDataFeed.address,
        MEDIAN_TIMEFRAME,
        RESOLUTION_DATE,
      )

      await assertRevert(async () => {
        await medianPriceOracle.setOutcome(2, 4)
      })
    })
  })
})

async function populateDataFeed(medianDataFeed) {
  let pingInterval = MEDIAN_TIMEFRAME / 3

  let dates = [
    RESOLUTION_DATE - (4 * pingInterval),
    RESOLUTION_DATE - (3 * pingInterval),
    RESOLUTION_DATE - (2 * pingInterval),
    RESOLUTION_DATE - pingInterval,
    RESOLUTION_DATE,
    RESOLUTION_DATE + pingInterval,
  ]

  let results = [5, 3, 1, 8, 7, 6].map(x => uintToBytes32(x))

  for (let i = 0; i < dates.length; i++) {
    await medianDataFeed.setResult(results[i], dates[i])
  }
}

function uintToBytes32(num) {
  const hexString = num.toString(16)
  return padToBytes32(hexString)
}

function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}
