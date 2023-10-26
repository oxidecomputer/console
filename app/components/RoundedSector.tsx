/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo, useState } from 'react'

import { useReducedMotion } from 'app/hooks'

const RoundedSector = ({
  angle,
  size,
  thickness,
  cornerRadius,
}: {
  angle: number
  size: number
  thickness: number
  cornerRadius?: number
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [interpolatedAngle, setInterpolatedAngle] = useState(0)

  useEffect(() => {
    const startValue = angle * 0.8
    const endValue = angle
    const duration = 1250

    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsedTime = currentTime - startTime
      const t = Math.min(elapsedTime / duration, 1)

      setInterpolatedAngle(startValue + (endValue - startValue) * easeOutQuart(t))

      if (t < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [angle])

  const outerRadius = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} version="1.1">
      <g
        fill="grey"
        transform={`translate(${outerRadius} ${outerRadius}) rotate(90) scale(-1 1)`}
      >
        <Sector
          angle={360}
          size={size}
          thickness={thickness}
          color="var(--base-neutral-300)"
        />
        <Sector
          angle={prefersReducedMotion ? angle : interpolatedAngle}
          size={size}
          thickness={thickness}
          cornerRadius={cornerRadius}
          color="var(--theme-accent-800)"
        />
      </g>
    </svg>
  )
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

const Sector = ({
  angle,
  size,
  thickness,
  cornerRadius = 0,
  color,
}: {
  angle: number
  size: number
  thickness: number
  cornerRadius?: number
  color: string
}) => {
  const outerRadius = size / 2
  const innerRadius = outerRadius - thickness

  // Clamps angle at the point that leaves at least
  // a 1px circumference on the inner circle
  const maxAngle = 360 - 360 / (2 * Math.PI * innerRadius)

  const path = useMemo(
    () => getPath(Math.min(maxAngle, angle), thickness, size, cornerRadius),
    [angle, thickness, size, cornerRadius, maxAngle]
  )

  // 0 angle shouldn't render anything
  if (angle === 0) return null

  // 360 angle returns a full circle
  if (angle >= 360) {
    return (
      <circle
        cx={0}
        cy={0}
        r={outerRadius - thickness / 2}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        opacity="1"
      />
    )
  }

  return <path d={path} fill={color} />
}

function getPath(angle: number, thickness: number, size: number, cornerRadius: number) {
  const outerRadius = size / 2
  const innerRadius = outerRadius - thickness

  // Min angle is a circumference of 2 * the cornerRadius
  // so that it doesn't intersect itself
  const circumference = calculateArcLength(angle, innerRadius)
  const minAngle = (((cornerRadius * 2) / innerRadius) * 180) / Math.PI
  const clampedAngle = circumference < cornerRadius * 2 ? minAngle : angle

  // outerLineEnd = OuterLineEndBezier
  const outerLineEnd = polarToCartesian(0, 0, outerRadius, clampedAngle)
  // outerLineEndCornerXY1: Move back along circumference by corner radius
  const outerLineEndCornerXY1 = moveAlongCircumference(
    outerLineEnd,
    outerRadius,
    cornerRadius
  )
  // outerLineEndCornerBezier = Outer line end
  const outerLineEndCornerBezier = outerLineEnd
  // outerLineEndCornerXY2: outerLineEndCornerBezier -> move towards origin by corner radius
  const outerLineEndCornerXY2 = moveTowardsOrigin(outerLineEndCornerBezier, cornerRadius)

  // innerLineStartCornerXY1: Move towards origin by thickness - 2x corner radius
  const innerLineStartCornerXY1 = moveTowardsOrigin(
    outerLineEndCornerBezier,
    thickness - cornerRadius
  )
  // innerLineStartCornerBezier: Move towards origin by corner radius
  const innerLineStartCornerBezier = moveTowardsOrigin(
    innerLineStartCornerXY1,
    cornerRadius
  )
  // innerLineStartCornerXY2: Move back along circumference by corner radius
  const innerLineStartCornerXY2 = moveAlongCircumference(
    innerLineStartCornerBezier,
    innerRadius,
    cornerRadius
  )

  // innerLineEnd
  const innerLineEnd = polarToCartesian(0, 0, innerRadius, 0)
  // innerLineEndCornerXY1: Move back along circumference by corner radius * -1
  const innerLineEndCornerXY1 = moveAlongCircumference(
    innerLineEnd,
    innerRadius,
    cornerRadius * -1
  )
  // innerLineEndCornerBezier: innerLineEnd
  const innerLineEndCornerBezier = innerLineEnd
  // innerLineEndCornerXY2: innerLineEndCornerBezier -> move away from origin by corner radius
  const innerLineEndCornerXY2 = moveTowardsOrigin(
    innerLineEndCornerBezier,
    cornerRadius * -1
  )

  // outerLineStartCornerXY1: Move away from origin by thickness - 2x corner radius
  const outerLinerStartCornerXY1 = moveTowardsOrigin(
    innerLineEndCornerXY2,
    (thickness - cornerRadius * 2) * -1
  )
  // outerLineStartCornerBezier: Move away from origin by corner radius
  const outerLineStartCornerBezier = moveTowardsOrigin(
    outerLinerStartCornerXY1,
    cornerRadius * -1
  )
  // outerLineStartCornerXY2: Move back along circumference by corner radius
  const outerLineStartCornerXY2 = moveAlongCircumference(
    outerLineStartCornerBezier,
    outerRadius,
    cornerRadius * -1
  )

  // We figure out the new outer angle which is shorter on account
  // of being reduced by the corner radius. If we don't do this it will
  // throw off the large-arc-flag and sweep-flag
  const newOuterAngle = calculateNewAngle(outerRadius, cornerRadius * 2, clampedAngle)
  const newInnerAngle = calculateNewAngle(innerRadius, cornerRadius * 2, clampedAngle)

  return `M ${outerLineStartCornerXY2.x},${outerLineStartCornerXY2.y}
      A ${outerRadius},${outerRadius},0,
      ${+(Math.abs(newOuterAngle) > 180)},0,
      ${outerLineEndCornerXY1.x},${outerLineEndCornerXY1.y}
      C ${outerLineEndCornerXY1.x} ${outerLineEndCornerXY1.y} ${
        outerLineEndCornerBezier.x
      } ${outerLineEndCornerBezier.y}  ${outerLineEndCornerXY2.x} ${outerLineEndCornerXY2.y}
      L ${innerLineStartCornerXY1.x} ${innerLineStartCornerXY1.y}
      C ${innerLineStartCornerXY1.x} ${innerLineStartCornerXY1.y} ${
        innerLineStartCornerBezier.x
      } ${innerLineStartCornerBezier.y}  ${innerLineStartCornerXY2.x} ${
        innerLineStartCornerXY2.y
      }
    A ${innerRadius},${innerRadius},0,
    ${+(Math.abs(newInnerAngle) > 180)},1,
    ${innerLineEndCornerXY1.x},${innerLineEndCornerXY1.y}
    C ${innerLineEndCornerXY1.x} ${innerLineEndCornerXY1.y} ${innerLineEndCornerBezier.x} ${
      innerLineEndCornerBezier.y
    }  ${innerLineEndCornerXY2.x} ${innerLineEndCornerXY2.y}
    L ${outerLinerStartCornerXY1.x} ${outerLinerStartCornerXY1.y}
    C ${outerLinerStartCornerXY1.x} ${outerLinerStartCornerXY1.y} ${
      outerLineStartCornerBezier.x
    } ${outerLineStartCornerBezier.y}  ${outerLineStartCornerXY2.x} ${
      outerLineStartCornerXY2.y
    }
    `
}

function calculateNewAngle(radius: number, cornerRadius: number, angle: number): number {
  // Calculate the original circumference of the full circle
  const originalCircumference = 2 * Math.PI * radius

  // Calculate the new circumference after reducing it by cornerRadius
  const newCircumference = originalCircumference - 2 * cornerRadius

  return (newCircumference / originalCircumference) * angle
}

function calculateArcLength(angle: number, radius: number): number {
  // Convert angle to radians
  const angleInRadians = (Math.PI / 180) * angle

  // Arc length formula: radius * angle (in radians)

  return radius * angleInRadians
}

type Vector = {
  x: number
  y: number
}

function moveTowardsOrigin(current: Vector, distance: number): Vector {
  const origin = { x: 0, y: 0 }
  const totalDistance = Math.sqrt(
    Math.pow(current.x - origin.x, 2) + Math.pow(current.y - origin.y, 2)
  )

  if (distance >= totalDistance) {
    return origin
  }

  const ratio = (totalDistance - distance) / totalDistance

  const newX = (current.x - origin.x) * ratio + origin.x
  const newY = (current.y - origin.y) * ratio + origin.y

  return { x: newX, y: newY }
}

function moveAlongCircumference(current: Vector, radius: number, distance: number): Vector {
  const origin = { x: 0, y: 0 }

  // Convert the distance moved along the circumference to an angle in radians.
  const angle = distance / radius

  // Find the current angle from the center to the current point.
  const currentAngle = Math.atan2(current.y - origin.y, current.x - origin.x)

  // Calculate the new angle.
  const newAngle = currentAngle + angle

  // Calculate the new coordinates.
  const newX = origin.x + radius * Math.cos(newAngle)
  const newY = origin.y + radius * Math.sin(newAngle)

  return { x: newX, y: newY }
}

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + Math.cos((-Math.PI / 180) * angle) * radius,
  y: cy + Math.sin((-Math.PI / 180) * angle) * radius,
})

export default RoundedSector
