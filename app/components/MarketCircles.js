import React from 'react'
import formatPrice from '../util/formatPrice'

const OUTER_CIRCLE_DIAMETER = 300
const OUTER_CIRCLE_RADIUS = OUTER_CIRCLE_DIAMETER / 2

const MarketCircles = ({
  yesDisplayPrice,
  noDisplayPrice,
  yesPercentage,
  noPercentage
}) => {
  const relativePercentages = calcRelativePercentages(yesPercentage, noPercentage)

  // TODO: get this working at all angles, write some formula for semi-randomizing
  const angle = 45

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
          diameter={OUTER_CIRCLE_DIAMETER * relativePercentages.yes - 2}
          color="#80aedc"
          nameText="YES"
          isYes={true}
          priceText={yesDisplayPrice}
        />
        <Circle
          angle={angle}
          diameter={OUTER_CIRCLE_DIAMETER * relativePercentages.no - 2}
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

  const radius = diameter / 2 - 1
  const virtualRadius = circleOffset(diameter, isYes)
  const virtualOrigin = (OUTER_CIRCLE_RADIUS - 12) / Math.PI
  const xOffset = virtualOrigin + virtualRadius * Math.cos(radians)
  const yOffset = virtualOrigin + virtualRadius * Math.sin(radians)

  let nameFontSize = Math.round(55 * (radius / OUTER_CIRCLE_RADIUS))
  if (nameFontSize < 8) nameFontSize = 8

  let priceFontSize = Math.round(26 * (radius / OUTER_CIRCLE_RADIUS))
  if (priceFontSize < 8) priceFontSize = 8

  let priceTextOffset = nameFontSize - 3

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
        fill="white">{`${formatPrice(priceText)} ETH`}</text>
    </g>
  )
}

function circleOffset(circleDiameter, offsetNegative) {
  const offsetSign = (offsetNegative ? -1 : 1)
  return OUTER_CIRCLE_RADIUS + ((OUTER_CIRCLE_DIAMETER - circleDiameter) / 2) * offsetSign - (3 * offsetSign)
}

function calcRelativePercentages(yesPercentage, noPercentage) {
  const diff = yesPercentage - noPercentage
  return {
    yes: .5 + (diff / 2),
    no: .5 - (diff / 2)
  }
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

export default MarketCircles
