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
import {
  Canvas,
  useFrame,
  type MeshProps,
  type ThreeEvent,
  type Vector3,
} from '@react-three/fiber'
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box3,
  Vector3 as Vec3,
  type Mesh,
  type OrthographicCamera as OrthographicCameraType,
} from 'three'

import { useMonitoring } from 'app/pages/system/monitoring/ExplorerPage'

import { Bounds, useBounds } from './Bounds'
import {
  getSledPosition,
  rackSize,
  sensors,
  sledSize,
  temperatureRanges,
  type Sensor as SensorType,
  type SensorValues,
} from './data'
import { SledHeatmap as Heatmap } from './Heatmap'
import { Select } from './Select'
import { useMonitoringStore } from './Store'
import { Cuboid, Cylinder, FanLine } from './WireframePrimitives'

const Scene = ({
  setZoom,
  cameraRef,
}: {
  setZoom: Dispatch<SetStateAction<number>>
  cameraRef: RefObject<OrthographicCameraType> | undefined
}) => {
  return (
    <>
      <Canvas orthographic style={{ background: '#101618' }}>
        <ZoomUpdater cameraRef={cameraRef} onZoom={(value) => setZoom(value)} />
        <OrthographicCamera
          makeDefault
          position={[1000, 1000, 1000]}
          near={100}
          far={10000}
          ref={cameraRef}
        />
        <OrbitControls
          makeDefault
          minZoom={3}
          maxZoom={50}
          rotateSpeed={1}
          maxPolarAngle={Math.PI / 2}
        />
        <Grid
          cellSize={0.025}
          sectionSize={0.05}
          sectionColor="#373F41"
          scale={100}
          position={[0, -0.5, 0]}
          fadeDistance={1000}
          fadeStrength={5}
        />
        <Bounds margin={1.2} maxDuration={0}>
          <SceneInner />
        </Bounds>
      </Canvas>
    </>
  )
}

const SceneInner = () => {
  const { setFitSledFn, setFitRackFn } = useMonitoringStore()
  const { sled } = useMonitoring()
  const bounds = useBounds()

  const boundsBoxRef = useRef(new Box3())

  useEffect(() => {
    if (!bounds) {
      return
    }

    setFitSledFn((index: number) => {
      if (!bounds) {
        return
      }

      const fitPosition = new Vec3(...getSledPosition(index))
      fitPosition.y = fitPosition.y + sledSize.y / 2
      const size = new Vec3(...Object.values(sledSize))
      boundsBoxRef.current.setFromCenterAndSize(fitPosition, size)

      bounds.refresh(boundsBoxRef.current).reset().fit()
    })

    setFitRackFn(() => {
      if (!bounds) {
        return
      }

      const fitPosition = new Vec3(0, rackSize.y / 2, 0)
      fitPosition.y = fitPosition.y + sledSize.y / 2
      const size = new Vec3(...Object.values(rackSize))
      boundsBoxRef.current.setFromCenterAndSize(fitPosition, size)

      bounds.refresh(boundsBoxRef.current).reset().fit()
    })
  }, [setFitSledFn, setFitRackFn, bounds])

  return (
    <mesh position={[0, sledSize.y / 2, 0]}>
      <Sled visible={sled !== undefined} />
      <Rack visible={sled === undefined} />
    </mesh>
  )
}

const Sled = (props: { visible: boolean }) => {
  const { sled, selectedComponent, setSelectedComponent, sensorDataArray, selectedTime } =
    useMonitoring()
  const sensorData = sensorDataArray[selectedTime || 0]

  const position = props.visible && sled !== undefined ? getSledPosition(sled) : [0, 0, 0]

  return (
    <mesh
      position={[
        position[0] - sledSize.x / 2,
        position[1] - sledSize.y / 2,
        position[2] - sledSize.z / 2,
      ]}
      {...props}
      name="sled"
    >
      <Heatmap
        position={[sledSize.x / 2, 0, sledSize.z / 2]}
        scale={[sledSize.x, sledSize.z, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        sensorValues={sensorData}
      />
      <Select
        selected={selectedComponent}
        setSelected={(value) => setSelectedComponent(value)}
        disabled={!props.visible}
      >
        {sensors.map((sensor) => (
          <Sensor
            key={sensor.label}
            data={sensor}
            sensorValues={sensorData}
            selectedComponent={selectedComponent}
          />
        ))}
      </Select>
      <Fans />

      {/* Sled */}
      <Cuboid
        position={[sledSize.x / 2, sledSize.y / 2, sledSize.z / 2]}
        scale={Object.values(sledSize) as Vector3}
        color="#2D3335"
      />
    </mesh>
  )
}

const Rack = (props: { visible: boolean }) => {
  const sleds = Array.from({ length: 32 })
  const { sled } = useMonitoring()
  return (
    <mesh name="rack">
      {sleds.map((_, index) => (
        <RackSled
          key={index}
          position={getSledPosition(index) as Vector3}
          index={index}
          disabled={!!sled}
          visible={props.visible}
        />
      ))}
      <Cuboid
        position={[0, rackSize.y / 2, 0]}
        scale={Object.values(rackSize) as Vector3}
        color="#2D3335"
        renderOrder={-1}
        transparent={!props.visible}
      />
    </mesh>
  )
}

const RackSled = ({
  position,
  index,
  disabled,
  visible,
}: {
  position: Vector3
  index: number
  disabled: boolean
  visible: boolean
}) => {
  const navigate = useNavigate()
  const { fitSled } = useMonitoringStore()

  return (
    <Cube
      position={position}
      scale={Object.values(sledSize) as Vector3}
      selectScaleOffset={2.5}
      color="#7E8385"
      name={`Sled ${index}`}
      isSelected={false}
      disabled={disabled}
      transparent={!visible}
      handleClick={(e: ThreeEvent<MouseEvent>) => {
        if (disabled) {
          return
        }
        e.stopPropagation()
        navigate(`/system/monitoring/explorer/sleds/${index}`)
        fitSled(index)
      }}
    />
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
  selectScaleOffset = 0.5,
  disabled = false,
  handleClick,
  transparent = false,
  ...props
}: MeshProps & {
  name: string
  color: string
  isSelected: boolean
  isUnhealthy?: boolean
  selectScaleOffset?: number
  disabled?: boolean
  transparent?: boolean
  handleClick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  const [hovered, setHover] = useState(false)
  const { sled } = useMonitoring()

  useCursor(hovered)

  const mixColor = new Color('#080F11')

  const restingColor = new Color(color).mix(mixColor, 50)
  const hoverColor = color

  const hoverFillColor = new Color(color).mix(mixColor, 80)

  useEffect(() => {
    setHover(false)
  }, [sled])

  return (
    <mesh {...props} name={name} onClick={handleClick}>
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
        onPointerOver={!disabled ? (e) => (e.stopPropagation(), setHover(true)) : undefined}
        onPointerOut={!disabled ? () => setHover(false) : undefined}
        visible={!transparent}
      >
        <boxGeometry />
        <meshBasicMaterial
          color={hovered || isUnhealthy ? hoverFillColor.toHexString() : '#101618'}
          toneMapped={false}
        />
      </mesh>
      <Cuboid
        color={hovered ? hoverColor : restingColor.toHexString()}
        transparent={transparent}
      />
      <Cuboid
        visible={isSelected}
        scale={addToScale(props.scale || 1, selectScaleOffset)}
        color="#48D597"
      />
    </mesh>
  )
}

const Fans = () => (
  <mesh position={[(sledSize.x / 4) * 2.95, sledSize.y / 2, sledSize.z / 2]}>
    <Cuboid color="#2D3335" scale={[sledSize.x / 10, sledSize.y, sledSize.z]} />
    <SpinningFan speed={1} offset={8.5} />
    <SpinningFan speed={1} />
    <SpinningFan speed={1} offset={-8.5} />
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
    <mesh
      position={[0, 0, offset]}
      rotation={[0, 0, -Math.PI / 2]}
      {...props}
      scale={sledSize.x}
    >
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
}: {
  data: SensorType
  sensorValues: SensorValues
  selectedComponent: string | null
}) => {
  const position = [
    data.position.x + data.size.x / 2,
    data.position.y + data.size.y / 2,
    data.position.z + data.size.z / 2,
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
        scale={Object.values(data.size) as Vector3}
        position={position}
        name={data.label}
        isSelected={isSelected}
        color={color}
        isUnhealthy={isUnhealthy}
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

export default Scene
