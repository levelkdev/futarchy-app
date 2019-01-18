import React from 'react'
import { ProgressBar } from '@aragon/ui'

const StepProgressBar = ({
  progress,
  children,
  stepPositions = [],
  width = null,
  height = null,
  hasStepZero = true,
  text = null,
}) => {
	const percent = progress*(100);

  	return (
      	<ProgressBar progress={progress}>
	       {React.Children.map(children, (step, index) => {
	          const position = stepPositions.length > 0
	            ? stepPositions[index]
	            : getStepPosition(React.Children.count(children), index, hasStepZero);

	          return React.cloneElement(step, {
	            accomplished: position <= {percent},
	            position,
	            index
	          });
	        })}
      	</ProgressBar>
  )
}

const Step = ({ accomplished, position, index, children }) => {

  return (
    <div>
    {children({ accomplished, position, index, })}
    </div>
  )
}

function getStepPosition(steps, stepIndex, hasStepZero) {
  if (hasStepZero) {
    return (100 / (steps - 1)) * stepIndex;
  }
  return (100 / steps) * (stepIndex + 1);
}

export default StepProgressBar