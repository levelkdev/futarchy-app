import React from 'react'
import styled from 'styled-components'

const OUTER_CIRCLE_DIAMETER = 300
const OUTER_CIRCLE_RADIUS = OUTER_CIRCLE_DIAMETER / 2

const MarketCircles = ({
  yesDisplayPrice,
  noDisplayPrice,
  yesPercentage,
  noPercentage
}) => {
  const relativePercentages = calcRelativePercentages(yesPercentage, noPercentage)
  return (
    <div>
      <div>{yesDisplayPrice}</div>
      <div>{noDisplayPrice}</div>
      <div>{yesPercentage}</div>
      <div>{noPercentage}</div>

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
          diameter={OUTER_CIRCLE_DIAMETER * relativePercentages.yes - 2}
          color="#80aedc"
          nameText="YES"
          isYes={true}
          priceText={yesDisplayPrice}
        />
        <Circle
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

const Circle = ({ diameter, color, nameText, priceText, isYes }) => {
  const radius = diameter / 2 - 1
  const xOffset = circleOffset(diameter, isYes)
  const yOffset = OUTER_CIRCLE_RADIUS
  let fontSize = Math.round(55 * (radius / OUTER_CIRCLE_RADIUS))
  if (fontSize < 8) fontSize = 8
  return (
    <g>
      <circle cx={xOffset} cy={yOffset} r={radius} fill={color} />
      <text x={xOffset} y={yOffset}
        font-family="sans-serif"
        font-size={`${fontSize}px`}
        text-anchor="middle"
        fill="white">{nameText}</text>
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

export default MarketCircles
