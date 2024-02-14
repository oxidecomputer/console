/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/* eslint-disable react/no-unknown-property */
import { TinyColor as Color } from '@ctrl/tinycolor'
import { Grid, OrbitControls, OrthographicCamera, useCursor } from '@react-three/drei'
import { Canvas, useFrame, type MeshProps, type Vector3 } from '@react-three/fiber'
import { useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { type Mesh, type OrthographicCamera as OrthographicCameraType } from 'three'

import { useMonitoring } from 'app/pages/system/monitoring/ExplorerPage'

import {
  normalizedSledSize,
  sensors,
  sledSize,
  temperatureRanges,
  type Sensor as SensorType,
  type SensorValues,
} from './data'
import { SledHeatmap as Heatmap } from './Heatmap'
import { Cuboid, Cylinder, FanLine } from './WireframePrimitives'

const SingleSled = ({
  setZoom,
  cameraRef,
  sensorData,
}: {
  setZoom: Dispatch<SetStateAction<number>>
  cameraRef: RefObject<OrthographicCameraType> | undefined
  sensorData: SensorValues
}) => {
  const { selectedComponent, setSelectedComponent } = useMonitoring()

  const heatmapBottomEl = useRef<HTMLCanvasElement>(null)

  const handleSelectSensor = (label: string) => {
    if (label) {
      setSelectedComponent(label)
    }
  }

  return (
    <>
      <Canvas orthographic style={{ background: '#101618' }}>
        <ZoomUpdater cameraRef={cameraRef} onZoom={(value) => setZoom(value)} />
        <OrthographicCamera makeDefault position={[5, 5, 5]} zoom={1000} ref={cameraRef} />
        <mesh
          position={[
            -normalizedSledSize.x / 2,
            -normalizedSledSize.y / 2,
            -normalizedSledSize.z / 2,
          ]}
        >
          <Heatmap
            id="heatmap_bottom"
            canvas={heatmapBottomEl}
            position={[normalizedSledSize.x / 2, 0, normalizedSledSize.z / 2]}
            scale={[normalizedSledSize.x, normalizedSledSize.z, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            sensorValues={sensorData}
          />
          {/* <Select
            onChangePointerUp={(mesh) => {
              if (mesh.length > 0 && mesh[0].name) {
                setSelectedComponent(mesh[0].name)
              }
            }}
          > */}
          {sensors.map((sensor) => (
            <Sensor
              key={sensor.label}
              data={sensor}
              sensorValues={sensorData}
              selectedComponent={selectedComponent}
              onClick={handleSelectSensor}
            />
          ))}
          {/* </Select> */}
          <Fans />
          <Sled />
          <Grid
            cellSize={0.025}
            sectionSize={0.05}
            sectionColor="#373F41"
            scale={2}
            position={[normalizedSledSize.x / 2, -0.05, normalizedSledSize.z / 2]}
            fadeDistance={10}
            fadeStrength={0.33}
          />
          <OrbitControls makeDefault minZoom={500} maxZoom={2000} rotateSpeed={1} />
        </mesh>
      </Canvas>
      <canvas
        id="heatmap_bottom"
        className="heatmap hidden"
        ref={heatmapBottomEl}
        width={sledSize.x}
        height={sledSize.z}
      />
    </>
  )
}

const ZoomUpdater = ({
  cameraRef,
  onZoom,
}: {
  cameraRef: RefObject<OrthographicCameraType> | undefined
  onZoom: (value: number) => void
}) => {
  useFrame(() => {
    if (cameraRef && cameraRef.current) {
      onZoom(cameraRef.current.zoom)
    }
  })
  return null
}

export function Cube({
  name,
  color,
  isSelected,
  isUnhealthy = false,
  selectScaleOffset = 0.01,
  handleClick,
  ...props
}: MeshProps & {
  name: string
  color: string
  isSelected: boolean
  isUnhealthy: boolean
  selectScaleOffset?: number
  handleClick: (label: string) => void
}) {
  const [hovered, setHover] = useState(false)

  // const isSelected = !!useSelect().find((sel) => sel.name === props.name)
  useCursor(hovered)

  const mixColor = new Color('#080F11')

  const restingColor = new Color(color).mix(mixColor, 50)
  const hoverColor = color

  const hoverFillColor = new Color(color).mix(mixColor, 80)

  return (
    <mesh
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        handleClick(name)
      }}
    >
      {/* {isSelected && (
        <Html className="pointer-events-none w-[240px] rounded border text-sans-md text-tertiary bg-raise border-secondary elevation-2">
          <div className="border-b px-3 py-2 border-secondary">Jan 6, 2022, 2:46:00 PM</div>
          <div className="px-3 py-2">
            <div className="text-sans-semi-md text-secondary">{props.name}</div>
            <div>32</div>
          </div>
        </Html>
      )} */}
      {/* Roughly shrink the box to smaller than the stroke so it doesn't look smaller
         at different angles */}
      <mesh
        scale={addToScale(props.scale || 1, -0.0001)}
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry />
        <meshBasicMaterial
          color={hovered || isUnhealthy ? hoverFillColor.toHexString() : '#101618'}
          toneMapped={false}
        />
      </mesh>
      <Cuboid color={hovered ? hoverColor : restingColor.toHexString()} />
      <Cuboid
        visible={isSelected}
        scale={addToScale(props.scale || 1, selectScaleOffset)}
        color="#48D597"
      />
    </mesh>
  )
}

export const Sled = () => (
  <Cuboid
    position={[
      normalizedSledSize.x / 2,
      normalizedSledSize.y / 2,
      normalizedSledSize.z / 2,
    ]}
    scale={Object.values(normalizedSledSize) as Vector3}
    color="#2D3335"
  />
)

const Fans = () => (
  <mesh
    position={[
      (normalizedSledSize.x / 4) * 2.95,
      normalizedSledSize.y / 2,
      normalizedSledSize.z / 2,
    ]}
  >
    <Cuboid
      color="#2D3335"
      scale={[normalizedSledSize.x / 10, normalizedSledSize.y, normalizedSledSize.z]}
    />
    <SpinningFan speed={1} offset={0.15} />
    <SpinningFan speed={1} />
    <SpinningFan speed={1} offset={-0.15} />
  </mesh>
)

const SpinningFan = ({
  speed,
  offset = 0,
  ...props
}: { speed: number; offset?: number } & MeshProps) => {
  const ref = useRef<Mesh>(null)
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += speed * delta
    }
  })

  return (
    <mesh position={[0, 0, offset]} rotation={[0, 0, -Math.PI / 2]} {...props}>
      <mesh ref={ref}>
        <Cylinder radius={0.025} length={0.025} sides={8} color="#2D3335" />
      </mesh>
      <FanLine timeOffset={offset} />
    </mesh>
  )
}

const Sensor = ({
  data,
  sensorValues,
  selectedComponent,
  onClick,
}: {
  data: SensorType
  sensorValues: SensorValues
  selectedComponent: string | null
  onClick: (label: string) => void
}) => {
  const normalizedSensorSize = {
    x: data.size.x / sledSize.x,
    y: data.size.y / sledSize.x,
    z: data.size.z / sledSize.x,
  }

  const position = [
    (data.position.x / sledSize.x) * normalizedSledSize.x + normalizedSensorSize.x / 2,
    (data.position.y / sledSize.y) * normalizedSledSize.y + normalizedSensorSize.y / 2,
    (data.position.z / sledSize.z) * normalizedSledSize.z + normalizedSensorSize.z / 2,
  ] as Vector3

  const temperature = sensorValues[data.label]
  const temperatureRange = temperatureRanges[data.type]
  const isUnhealthy = temperature >= temperatureRange[1]

  const noticeColor = new Color('#F5B944')
  const urgentColor = new Color('#FB6E88')

  const mixPercentage =
    ((temperature - temperatureRange[1]) / (temperatureRange[2] - temperatureRange[1])) *
    100
  const unhealthyColor = noticeColor.mix(urgentColor, mixPercentage)

  const color = isUnhealthy ? unhealthyColor.toHexString() : '#7E8385'

  const isSelected = data.label === selectedComponent

  return (
    <>
      <Cube
        scale={Object.values(normalizedSensorSize) as Vector3}
        position={position}
        name={data.label}
        isSelected={isSelected}
        color={color}
        isUnhealthy={isUnhealthy}
        handleClick={onClick}
      />
    </>
  )
}

function addToScale(scale: Vector3, offset: number) {
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale]
  return scaleArray.map((scale) =>
    typeof scale === 'number' ? 1 + (1 / scale) * offset : scale
  ) as [number, number, number]
}

export default SingleSled
