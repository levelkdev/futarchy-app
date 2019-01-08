import React from 'react'
import formatPrice from '../util/formatPrice'

const OUTER_CIRCLE_DIAMETER = 200
const OUTER_CIRCLE_RADIUS = OUTER_CIRCLE_DIAMETER / 2
const CIRCLE_MIN_RELATIVE_PERCENTAGE = 0.32
const CIRCLE_NAME_MAX_FONT_SIZE = 35
const CIRCLE_PRICE_MAX_FONT_SIZE = 28
const MIN_FONT_SIZE = 8

const MarketCircles = ({
  yesDisplayPrice,
  noDisplayPrice,
  yesPercentage,
  noPercentage
}) => {
  // TODO: get this working at all angles, write some formula for semi-randomizing
  const angle = 45
  const circleDiameters = calcCircleDiameters(yesPercentage, noPercentage)

  return (
    <div>
      <svg height={OUTER_CIRCLE_DIAMETER} width={OUTER_CIRCLE_DIAMETER}>
        <circle
          cx={OUTER_CIRCLE_RADIUS}
          cy={OUTER_CIRCLE_RADIUS}
          r={OUTER_CIRCLE_RADIUS - 2}
          stroke="#e8e8e8"
          stroke-width="2"
          fill="transparent"
        />
        <Circle
          angle={angle}
          diameter={circleDiameters.yes}
          color="#80aedc"
          nameText="YES"
          isYes={true}
          priceText={yesDisplayPrice}
        />
        <Circle
          angle={angle}
          diameter={circleDiameters.no}
          color="#38cad0"
          nameText="NO"
          isYes={false}
          priceText={noDisplayPrice}
        />
      </svg>
    </div>
  )
}

const Circle = ({ angle, diameter, color, nameText, priceText, isYes }) => {
  const radians = toRadians(angle)

  const magicNumber = 8

  const radius = diameter / 2 - 1
  const virtualRadius = circleOffset(diameter, isYes)
  const virtualOrigin = (OUTER_CIRCLE_RADIUS - magicNumber) / Math.PI
  const xOffset = virtualOrigin + virtualRadius * Math.cos(radians)
  const yOffset = virtualOrigin + virtualRadius * Math.sin(radians)

  let nameFontSize = Math.round(CIRCLE_NAME_MAX_FONT_SIZE * (radius / OUTER_CIRCLE_RADIUS))
  if (nameFontSize < MIN_FONT_SIZE) nameFontSize = MIN_FONT_SIZE

  let priceFontSize = Math.round(CIRCLE_PRICE_MAX_FONT_SIZE * (radius / OUTER_CIRCLE_RADIUS))
  if (priceFontSize < MIN_FONT_SIZE) priceFontSize = MIN_FONT_SIZE

  let priceTextOffset = nameFontSize

  return (
    <g>
      <circle cx={xOffset} cy={yOffset} r={radius} fill={color} />
      <text x={xOffset} y={yOffset}
        font-family="sans-serif"
        font-size={`${nameFontSize}px`}
        text-anchor="middle"
        fill="white">{nameText}</text>
      <text x={xOffset} y={yOffset + priceTextOffset}
        font-family="sans-serif"
        font-size={`${priceFontSize}px`}
        text-anchor="middle"
        fill="#ffffffab">{`${formatPrice(priceText)} ETH`}</text>
    </g>
  )
}

function circleOffset(circleDiameter, offsetNegative) {
  const offsetSign = (offsetNegative ? -1 : 1)
  return OUTER_CIRCLE_RADIUS + ((OUTER_CIRCLE_DIAMETER - circleDiameter) / 2) * offsetSign - (3 * offsetSign)
}

function calcCircleDiameters(yesPercentage, noPercentage) {
  const relativePercentages = calcRelativePercentages(yesPercentage, noPercentage)
  return {
    yes: OUTER_CIRCLE_DIAMETER * relativePercentages.yes - 2,
    no: OUTER_CIRCLE_DIAMETER * relativePercentages.no - 2
  }
}

function calcRelativePercentages(yesPercentage, noPercentage) {
  const diff = yesPercentage - noPercentage
  let relativePercentages = {
    yes: .5 + (diff / 2),
    no: .5 - (diff / 2)
  }
  if(relativePercentages.yes < CIRCLE_MIN_RELATIVE_PERCENTAGE) {
    const adjustmentDiff = CIRCLE_MIN_RELATIVE_PERCENTAGE - relativePercentages.yes
    relativePercentages.yes = CIRCLE_MIN_RELATIVE_PERCENTAGE
    relativePercentages.no = relativePercentages.no - adjustmentDiff
  }
  return relativePercentages
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

export default MarketCircles
