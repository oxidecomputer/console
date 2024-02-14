/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/* eslint-disable react/no-unknown-property */
import {
  extend,
  useFrame,
  useThree,
  type MaterialNode,
  type MeshProps,
  type Object3DNode,
} from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector2 } from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js'

extend({ LineMaterial, Line2 })

const FanLine = ({ timeOffset = 0.01, ...props }: { timeOffset: number } & MeshProps) => {
  const lineRef = useRef<Line2>(null)
  const materialRef = useRef<LineMaterial>(null)
  useFrame((_, delta) => {
    if (lineRef.current && materialRef.current) {
      lineRef.current.computeLineDistances()
      materialRef.current.dashOffset += delta / 10
    }
  })

  const { size } = useThree()
  const positions = [0, -0.025, 0, 0, -0.075, 0]

  const geom = new LineGeometry()
  geom.setPositions(positions)

  useEffect(() => {
    if (materialRef && materialRef.current) {
      materialRef.current.resolution.set(size.width, size.height)
      materialRef.current.dashOffset = timeOffset
    }
  }, [timeOffset, materialRef, size.width, size.height])

  return (
    <>
      {/* @ts-expect-error */}
      <line2 geometry={geom} {...props} ref={lineRef}>
        <lineMaterial
          transparent
          linewidth={1}
          color="white"
          opacity={0.4}
          dashed
          dashSize={0.05}
          dashScale={1}
          gapSize={0.2}
          ref={materialRef}
        />
      </line2>
    </>
  )
}

type CuboidProps = {
  color?: string
  lineWidth?: number
}

const Cuboid = ({
  color = 'white',
  lineWidth = 1,
  children,
  ...props
}: CuboidProps & MeshProps) => {
  const { size } = useThree()
  const positions = getCuboidWireframeVertices(1, 1, 1)

  const geom = new LineGeometry()
  geom.setPositions(positions)

  return (
    <>
      {/* @ts-expect-error */}
      <line2 geometry={geom} {...props}>
        <lineMaterial
          transparent
          linewidth={lineWidth}
          color={color}
          depthWrite={false}
          toneMapped={false}
          resolution={new Vector2(size.width, size.height)}
        />
      </line2>
      {children}
    </>
  )
}

function getCuboidWireframeVertices(width: number, height: number, depth: number) {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const halfDepth = depth / 2

  const vertices = [
    [-halfWidth, -halfHeight, -halfDepth], // Vertex 1
    [halfWidth, -halfHeight, -halfDepth], // Vertex 2
    [halfWidth, halfHeight, -halfDepth], // Vertex 3
    [-halfWidth, halfHeight, -halfDepth], // Vertex 4
    [-halfWidth, -halfHeight, -halfDepth], // Vertex 1
    [-halfWidth, -halfHeight, halfDepth], // Vertex 5
    [halfWidth, -halfHeight, halfDepth], // Vertex 6
    [halfWidth, halfHeight, halfDepth], // Vertex 7
    [-halfWidth, halfHeight, halfDepth], // Vertex 8
    [-halfWidth, -halfHeight, halfDepth], // Vertex 5
    [halfWidth, -halfHeight, halfDepth], // Vertex 6
    [halfWidth, -halfHeight, -halfDepth], // Vertex 2
    [halfWidth, halfHeight, -halfDepth], // Vertex 3
    [halfWidth, halfHeight, halfDepth], // Vertex 7
    [-halfWidth, halfHeight, halfDepth], // Vertex 8
    [-halfWidth, halfHeight, -halfDepth], // Vertex 4
  ]

  return vertices.flat()
}

type CylinderProps = {
  color?: string
  lineWidth?: number
  radius: number
  length: number
  sides: number
}

const Cylinder = ({
  color = 'white',
  lineWidth = 1,
  children,
  radius,
  length,
  sides,
  ...props
}: CylinderProps & MeshProps) => {
  const { size } = useThree()
  const positions = getCylinderWireframeVertices(radius, length, sides)

  const geom = new LineGeometry()
  geom.setPositions(positions)

  return (
    <>
      {/* @ts-expect-error */}
      <line2 geometry={geom} {...props}>
        <lineMaterial
          transparent
          linewidth={lineWidth}
          color={color}
          depthWrite={false}
          toneMapped={false}
          resolution={new Vector2(size.width, size.height)}
        />
      </line2>
      {children}
    </>
  )
}

function getCylinderWireframeVertices(radius: number, length: number, sides: number) {
  const halfLength = length / 2
  const angleStep = (2 * Math.PI) / sides
  const vertices = []

  // Generate vertices for the top and bottom circles and the vertical edges
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep
    const nextAngle = ((i + 1) % sides) * angleStep

    const x1 = radius * Math.cos(angle)
    const z1 = radius * Math.sin(angle)

    const x2 = radius * Math.cos(nextAngle)
    const z2 = radius * Math.sin(nextAngle)

    // Vertices for one quad
    vertices.push([x1, halfLength, z1]) // Top circle vertex 1
    vertices.push([x1, -halfLength, z1]) // Bottom circle vertex 1
    vertices.push([x2, -halfLength, z2]) // Bottom circle vertex 2
    vertices.push([x2, halfLength, z2]) // Top circle vertex 2
  }

  // Add vertices for the second circle
  for (let i = 0; i < sides + 1; i++) {
    const angle = i * angleStep

    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)

    vertices.push([x, halfLength, z]) // Bottom circle vertices
  }

  return vertices.flat()
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    line2: Object3DNode<Line2, typeof Line2>
    lineMaterial: MaterialNode<LineMaterial, typeof LineMaterial>
  }
}

export { Cuboid, Cylinder, FanLine }
