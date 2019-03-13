import React from 'react'
import { YES_COLOR, NO_COLOR } from '../constants/colorValues'
import decisionMarketTypes from '../constants/decisionMarketTypes'
import formatPredictedValue from '../util/formatPredictedValue'

const OUTER_CIRCLE_DIAMETER = 180
const OUTER_CIRCLE_RADIUS = OUTER_CIRCLE_DIAMETER / 2
const CIRCLE_MIN_RELATIVE_PERCENTAGE = 0.32
const CIRCLE_NAME_MAX_FONT_SIZE = 48
const CIRCLE_PRICE_MAX_FONT_SIZE = 21
const MIN_FONT_SIZE = 10
const TEXT_BOTTOM_MARGIN = 3
const LOSER_CIRCLE_COLOR = "#DAEAEF"

const MarketCircles = ({
  yesDisplayPrice,
  noDisplayPrice,
  yesPercentage,
  noPercentage,
  marketWinner
}) => {
  let y = yesPercentage
  let n = noPercentage
  
  if (typeof(y) == 'undefined') y = 0.5
  if (typeof(n) == 'undefined') n = 0.5

  const { yes: yesDiam, no: noDiam } = calcCircleDiameters(y, n)

  // Moves the inner circle axis angle between -60 degrees and 60 degrees
  // (60 degrees = π/3 radians)
  // When the YES diameter is at it's max value, the angle is 60 degrees
  // When the NO diameter is at it's max value, the angle is -60 degrees
  // Since YES is positioned to the left and NO is positioned to the right,
  // this calculation ensures that the bigger circle is always above the smaller circle
  const SIXTY_DEGREES_IN_RADIANS = Math.PI / 3
  const angle = 
    ((yesDiam - noDiam) / (yesDiam + noDiam))
       * SIXTY_DEGREES_IN_RADIANS
       * (1 / (1 - (2 * CIRCLE_MIN_RELATIVE_PERCENTAGE)))

  return (
    <div>
      <svg height={OUTER_CIRCLE_DIAMETER} width={OUTER_CIRCLE_DIAMETER}>
        <circle
          cx={OUTER_CIRCLE_RADIUS}
          cy={OUTER_CIRCLE_RADIUS}
          r={OUTER_CIRCLE_RADIUS}
          stroke="#e8e8e8"
          strokeWidth="2"
          fill="transparent"
        />
        <Circle
          angle={angle}
          diameter={yesDiam}
          color={(marketWinner == decisionMarketTypes.NO) ? LOSER_CIRCLE_COLOR : YES_COLOR}
          nameText="YES"
          isYes={true}
          priceText={yesDisplayPrice}
          loser={(marketWinner == decisionMarketTypes.NO)}
        />
        <Circle
          angle={angle}
          diameter={noDiam}
          color={(marketWinner == decisionMarketTypes.YES) ? LOSER_CIRCLE_COLOR : NO_COLOR}
          nameText="NO"
          isYes={false}
          priceText={noDisplayPrice}
          loser={(marketWinner == decisionMarketTypes.YES)}
        />
      </svg>
    </div>
  )
}

const Circle = ({ angle, diameter, color, nameText, priceText, isYes, loser }) => {
  const radius = diameter / 2

  // offset YES circle to left and NO circle to right
  const xOffset = OUTER_CIRCLE_RADIUS + (OUTER_CIRCLE_RADIUS - radius) * (isYes ? -1 : 1) * Math.cos(angle)
  const yOffset = OUTER_CIRCLE_RADIUS + (OUTER_CIRCLE_RADIUS - radius) * (isYes ? -1 : 1) * Math.sin(angle)
  const lineStartX = xOffset - radius;
  const lineEndX = xOffset + radius;
  const fontColor = loser ? "#A4B2B6" : "#ffffff";

  let nameFontSize = Math.round(CIRCLE_NAME_MAX_FONT_SIZE * (radius / OUTER_CIRCLE_RADIUS))
  if (nameFontSize < MIN_FONT_SIZE) nameFontSize = MIN_FONT_SIZE

  let priceFontSize = Math.round(CIRCLE_PRICE_MAX_FONT_SIZE * (radius / OUTER_CIRCLE_RADIUS))
  if (priceFontSize < MIN_FONT_SIZE) priceFontSize = MIN_FONT_SIZE

  let priceTextOffset = (priceFontSize + TEXT_BOTTOM_MARGIN)

  return (
    <g>
      <circle cx={xOffset} cy={yOffset} r={radius} fill={color} />
      <text x={xOffset} y={yOffset}
        fontFamily="overpass,sans-serif"
        fontSize={`${nameFontSize}px`}
        textAnchor="middle"
        fill={fontColor}>{nameText}</text>
      {
        priceText ? (
          <text x={xOffset} y={yOffset + priceTextOffset}
            fontFamily="overpass,sans-serif"
            fontSize={`${priceFontSize}px`}
            textAnchor="middle"
            fill={fontColor}>{formatPredictedValue(priceText)}</text>
        ): <text x={xOffset} y={yOffset + priceTextOffset}
          fontFamily="overpass,sans-serif"
          fontSize={`${priceFontSize}px`}
          textAnchor="middle"
          fill={fontColor}>Loading...</text>
      }
      {
        (loser && priceText) ? (
          <line x1={lineStartX} y1={yOffset} x2={lineEndX} y2={yOffset} stroke="rgb(164,178,182)" strokeWidth="2" 
          transform={`rotate(45, ${xOffset}, ${yOffset})`}/>
        ) : null
      }
    </g>
  )
}

function calcCircleDiameters(yesPercentage, noPercentage) {
  const relativePercentages = calcRelativePercentages(yesPercentage, noPercentage)
  return {
    yes: OUTER_CIRCLE_DIAMETER * relativePercentages.yes,
    no: OUTER_CIRCLE_DIAMETER * relativePercentages.no
  }
}

function calcRelativePercentages(yesPercentage, noPercentage) {
  const diff = yesPercentage - noPercentage
  let relativePercentages = {
    yes: .5 + (diff / 2),
    no: .5 - (diff / 2)
  }
  for (var i = 0; i < 2; i++) {
    const val = i == 0 ? 'yes' : 'no'
    const oppositeVal = i == 0 ? 'no' : 'yes'
    if(relativePercentages[val] < CIRCLE_MIN_RELATIVE_PERCENTAGE) {
      const adjustmentDiff = CIRCLE_MIN_RELATIVE_PERCENTAGE - relativePercentages[val]
      relativePercentages[val] = CIRCLE_MIN_RELATIVE_PERCENTAGE
      relativePercentages[oppositeVal] = relativePercentages[oppositeVal] - adjustmentDiff
    }
  }
  return relativePercentages
}

export default MarketCircles
