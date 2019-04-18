import assert from 'assert'
import performance from './performance'

const mockTradesAction_Decision23_trader11 = {
  type: 'BUY_MARKET_POSITIONS_EVENT',
  returnValues: {
    decisionId: '23',
    noCosts: ['1', '2'],
    yesCosts: ['3', '4'],
    noPurchaseAmounts: ['5', '6'],
    yesPurchaseAmounts: ['7', '8'],
    trader: 'trader_11'
  }
}

const mockTradesAction_Sell_Decision23_trader11 = {
  type: 'SELL_MARKET_POSITIONS_EVENT',
  returnValues: {
    decisionId: '23',
    trader: 'trader_11',
    marginalPrices: ['0', '2', '1', '0'],
    noCollateralReceived: '3',
    noMarketPositions: ['-1, 0'],
    yesCollateralReceived: '4',
    yesMarketPositions: ['0', '-8']
  }
}

const mockTradesAction_Rewards_Decision23_trader11 = {
  type: 'REDEEM_SCALAR_WINNINGS_EVENT',
  passed: true,
  returnValues: {
    decisionId: '23',
    trader: 'trader_11',
    winnings: '52'
  }
}

const mockTotal = (
  decisionId,
  trader,
  yesCostBasis,
  noCostBasis,
  yesCollateralBalance,
  noCollateralBalance,
  yesShortBalance,
  yesLongBalance,
  noShortBalance,
  noLongBalance
) => ({
  decisionId,
  trader,
  yesCostBasis,
  noCostBasis,
  yesCollateralBalance,
  noCollateralBalance,
  yesShortBalance,
  yesLongBalance,
  noShortBalance,
  noLongBalance
})

describe('performance', () => {

  describe('when given a BUY_MARKET_POSITIONS_EVENT action and a state with current totals', () => {
    let result

    beforeEach(() => {
      result = performance(
        [
          mockTotal('23', 'trader_09', 100, 200, 50, 60, 300, 400, 500, 600),
          mockTotal('23', 'trader_11', 100, 200, 50, 60, 300, 400, 500, 600)
        ],
        mockTradesAction_Decision23_trader11
      )
    })

    it('should add to yesCostBasis for the correct trader and decision', () => {
      assert.equal(result[1].yesCostBasis, 107)
    })

    it('should add to noCostBasis for the correct trader and decision', () => {
      assert.equal(result[1].noCostBasis, 203)
    })

    it('should add to yesShortBalance for the correct trader and decision', () => {
      assert.equal(result[1].yesShortBalance, 307)
    })

    it('should add to yesLongBalance for the correct trader and decision', () => {
      assert.equal(result[1].yesLongBalance, 408)
    })

    it('should add to noShortBalance for the correct trader and decision', () => {
      assert.equal(result[1].noShortBalance, 505)
    })

    it('should add to noLongBalance for the correct trader and decision', () => {
      assert.equal(result[1].noLongBalance, 606)
    })

    it('should not add to yesCostBasis for non-matching traders', () => {
      assert.equal(result[0].yesCostBasis, 100)
    })

    it('should not add to noCostBasis for non-matching traders', () => {
      assert.equal(result[0].noCostBasis, 200)
    })

    it('should not add to yesShortBalance for non-matching traders', () => {
      assert.equal(result[0].yesShortBalance, 300)
    })

    it('should not add to yesLongBalance for non-matching traders', () => {
      assert.equal(result[0].yesLongBalance, 400)
    })

    it('should not add to noShortBalance for non-matching traders', () => {
      assert.equal(result[0].noShortBalance, 500)
    })

    it('should not add to noLongBalance for non-matching traders', () => {
      assert.equal(result[0].noLongBalance, 600)
    })

    it('should not add additional total objects', () => {
      assert.equal(result.length, 2)
    })
  })

  describe('when given a BUY_MARKET_POSITIONS_EVENT action and a state with no matching trader', () => {
    let result

    beforeEach(() => {
      result = performance(
        [mockTotal('23', 'trader_09', 100, 200, 300, 400, 500, 600)],
        mockTradesAction_Decision23_trader11
      )
    })

    it('should add a total with yesCostBasis set for the correct trader and decision', () => {
      assert.equal(result[1].yesCostBasis, 7)
    })

    it('should add a total with noCostBasis set for the correct trader and decision', () => {
      assert.equal(result[1].noCostBasis, 3)
    })

    it('should add a total with yesShortBalance set for the correct trader and decision', () => {
      assert.equal(result[1].yesShortBalance, 7)
    })

    it('should add a total with yesLongBalance set for the correct trader and decision', () => {
      assert.equal(result[1].yesLongBalance, 8)
    })

    it('should add a total with noShortBalance set for the correct trader and decision', () => {
      assert.equal(result[1].noShortBalance, 5)
    })

    it('should add a total with noLongBalance set for the correct trader and decision', () => {
      assert.equal(result[1].noLongBalance, 6)
    })
  })

  describe('when given a SELL_MARKET_POSITIONS_EVENT action', () => {
    let result, yesCollateralBalance, noCollateralBalance

    beforeEach(() => {
      yesCollateralBalance = 50
      noCollateralBalance = 60

      result = performance(
        [
          mockTotal('23', 'trader_09', 100, 200, yesCollateralBalance, noCollateralBalance, 300, 400, 500, 600),
          mockTotal('23', 'trader_11', 100, 200, yesCollateralBalance, noCollateralBalance, 300, 400, 500, 600)
        ],
        mockTradesAction_Sell_Decision23_trader11
      )
    })

    it('should add yesCollateralReceived onto yesCollateralBalance', () => {
      let yesReceived = mockTradesAction_Sell_Decision23_trader11.returnValues.yesCollateralReceived
      assert.equal(result[1].yesCollateralBalance, yesCollateralBalance + parseInt(yesReceived))
    })

    it('should add noCollateralReceived onto noCollateralBalance', () => {
      let noReceived = mockTradesAction_Sell_Decision23_trader11.returnValues.noCollateralReceived
      assert.equal(result[1].noCollateralBalance, noCollateralBalance + parseInt(noReceived))
    })

    it('should reset yesShortBalance to 0', () => {
      assert.equal(result[1].yesShortBalance, 0)
    })

    it('should reset yesLongBalance to 0', () => {
      assert.equal(result[1].yesLongBalance, 0)
    })

    it('should reset noShortBalance to 0', () => {
      assert.equal(result[1].noShortBalance, 0)
    })

    it('should reset noLongBalance to 0', () => {
      assert.equal(result[1].noLongBalance, 0)
    })

    it('should reset yesShortPotentialProfit to 0', () => {
      assert.equal(result[1].yesShortPotentialProfit, 0)
    })

    it('should reset yesLongPotentialProfit to 0', () => {
      assert.equal(result[1].yesLongPotentialProfit, 0)
    })

    it('should reset noShortPotentialProfit to 0', () => {
      assert.equal(result[1].noShortPotentialProfit, 0)
    })

    it('should reset noLongPotentialProfit to 0', () => {
      assert.equal(result[1].noLongPotentialProfit, 0)
    })

    it('should reset yesPotentialProfit to 0', () => {
      assert.equal(result[1].yesPotentialProfit, 0)
    })

    it('should reset noPotentialProfit to 0', () => {
      assert.equal(result[1].noPotentialProfit, 0)
    })

    it('should reset yesGainLoss to 0', () => {
      assert.equal(result[1].yesGainLoss, 0)
    })

    it('should reset noGainLoss to 0', () => {
      assert.equal(result[1].noGainLoss, 0)
    })

    it('should reset totalPotentialProfit to 0', () => {
      assert.equal(result[1].totalPotentialProfit, 0)
    })

    it('should reset totalGainLoss to 0', () => {
      assert.equal(result[1].totalGainLoss, 0)
    })
  })

  describe('when given a REDEEM_SCALAR_WINNINGS_EVENT action', () => {
    let result, yesCollateralBalance, noCollateralBalance, yesShortBalance, yesLongBalance, noShortBalance, noLongBalance

    beforeEach(() => {
      yesCollateralBalance = 50
      noCollateralBalance = 60
      yesShortBalance = 300
      yesLongBalance = 400
      noShortBalance = 500
      noLongBalance = 600

      result = performance(
        [
          mockTotal('23', 'trader_09', 100, 200, yesCollateralBalance, noCollateralBalance, yesShortBalance, yesLongBalance, noShortBalance, noLongBalance),
          mockTotal('23', 'trader_11', 100, 200, yesCollateralBalance, noCollateralBalance, yesShortBalance, yesLongBalance, noShortBalance, noLongBalance)
        ],
        mockTradesAction_Rewards_Decision23_trader11
      )
    })

    describe('if decision was passed', () => {
      it('should reset yesShortBalance to 0', () => {
        assert.equal(result[1].yesShortBalance, 0)
      })

      it('should reset yesLongBalance to 0', () => {
        assert.equal(result[1].yesLongBalance, 0)
      })

      it('should leave noShortBalance unaffected', () => {
        assert.equal(result[1].noShortBalance, noShortBalance)
      })

      it('should leave noLongBalance unaffected', () => {
        assert.equal(result[1].noLongBalance, noLongBalance)
      })
    })

    describe('if decision failed', () => {
      beforeEach(() => {
        mockTradesAction_Rewards_Decision23_trader11.passed = false
        result = performance(
          [
            mockTotal('23', 'trader_09', 100, 200, yesCollateralBalance, noCollateralBalance, yesShortBalance, yesLongBalance, noShortBalance, noLongBalance),
            mockTotal('23', 'trader_11', 100, 200, yesCollateralBalance, noCollateralBalance, yesShortBalance, yesLongBalance, noShortBalance, noLongBalance)
          ],
          mockTradesAction_Rewards_Decision23_trader11
        )
      })
      it('should leave yesShortBalance unaffected', () => {
        assert.equal(result[1].yesShortBalance, yesShortBalance)
      })

      it('should leave yesLongBalance unaffected', () => {
        assert.equal(result[1].yesLongBalance, yesLongBalance)
      })

      it('should reset noShortBalance to 0', () => {
        assert.equal(result[1].noShortBalance, 0)
      })

      it('should reset  noLongBalance to 0', () => {
        assert.equal(result[1].noLongBalance, 0)
      })
    })

    it('should leave yesCollateralBalance unaffected', () => {
      assert.equal(result[1].yesCollateralBalance, yesCollateralBalance)
    })

    it('should  leave noCollateralBalance unaffected', () => {
      assert.equal(result[1].noCollateralBalance, noCollateralBalance)
    })

    it('should reset yesShortPotentialProfit to 0', () => {
      assert.equal(result[1].yesShortPotentialProfit, 0)
    })

    it('should reset yesLongPotentialProfit to 0', () => {
      assert.equal(result[1].yesLongPotentialProfit, 0)
    })

    it('should reset noShortPotentialProfit to 0', () => {
      assert.equal(result[1].noShortPotentialProfit, 0)
    })

    it('should reset noLongPotentialProfit to 0', () => {
      assert.equal(result[1].noLongPotentialProfit, 0)
    })

    it('should reset yesPotentialProfit to 0', () => {
      assert.equal(result[1].yesPotentialProfit, 0)
    })

    it('should reset noPotentialProfit to 0', () => {
      assert.equal(result[1].noPotentialProfit, 0)
    })

    it('should reset yesGainLoss to 0', () => {
      assert.equal(result[1].yesGainLoss, 0)
    })

    it('should reset noGainLoss to 0', () => {
      assert.equal(result[1].noGainLoss, 0)
    })

    it('should reset totalPotentialProfit to 0', () => {
      assert.equal(result[1].totalPotentialProfit, 0)
    })

    it('should reset totalGainLoss to 0', () => {
      assert.equal(result[1].totalGainLoss, 0)
    })
  })

  // TODO: fix these tests, now that the POTENTIAL_PROFIT_DATA_LOADED action
  // has been removed and refactored
  //
  // describe('when given a POTENTIAL_PROFIT_DATA_LOADED action', () => {
  //   let result

  //   beforeEach(() => {
  //     result = performance(
  //       [
  //         mockTotal('23', 'trader_09', 100, 200, 300, 400, 500, 600),
  //         mockTotal('23', 'trader_11', 100, 200, 300, 400, 500, 600)
  //       ],
  //       mockPotentialProfitDataLoadedAction_Decision23_trader11
  //     )
  //   })

  //   it('should update YES performance data for target trader', () => {
  //     assert.equal(result[1].yesShortPotentialProfit, 300)
  //     assert.equal(result[1].yesLongPotentialProfit, 400)
  //     assert.equal(result[1].yesPotentialProfit, 700)
  //     assert.equal(result[1].yesGainLoss, 600)
  //   })

  //   it('should update NO performance data for target trader', () => {
  //     assert.equal(result[1].noShortPotentialProfit, 25)
  //     assert.equal(result[1].noLongPotentialProfit, 50)
  //     assert.equal(result[1].noPotentialProfit, 75)
  //     assert.equal(result[1].noGainLoss, -125)
  //   })

  //   it('should update total performance data for target trader', () => {
  //     assert.equal(result[1].totalPotentialProfit, 775)
  //     assert.equal(result[1].totalGainLoss, 475)
  //   })
  // })

})
