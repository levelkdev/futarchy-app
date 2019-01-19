import React from 'react'
import { Badge, theme } from '@aragon/ui'

const CountBadge = ({ count }) => (
  <Badge
    background={theme.secondaryBackground}
    foreground={theme.textTertiary}
  >
    {count}
  </Badge>
)

export default CountBadge
