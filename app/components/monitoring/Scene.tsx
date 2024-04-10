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
  useThree,
  type MeshProps,
  type ThreeEvent,
  type Vector3,
} from '@react-three/fiber'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box3,
  Euler,
  Vector3 as Vec3,
  type Mesh,
  type OrthographicCamera as OrthographicCameraType,
} from 'three'

import {
  maxZoom,
  minZoom,
  useMonitoring,
  type SelectedComponent,
} from 'app/pages/system/monitoring/ExplorerPage'

import {
  fans,
  generateSensorValue,
  getSledPosition,
  rackSize,
  sensorRanges,
  sensors,
  sledSize,
  type Sensor as SensorType,
  type SensorValues,
} from './data'
import { SledHeatmap } from './Heatmap'
import { Select } from './Select'
import { useMonitoringStore } from './Store'
import { Cuboid, Cylinder } from './WireframePrimitives'

const defaultSledZoom = 12
const defaultRackZoom = 3

export const Scene = ({
  setZoom,
  cameraRef,
}: {
  setZoom: Dispatch<SetStateAction<number>>
  cameraRef: RefObject<OrthographicCameraType> | undefined
}) => {
  const { sled } = useMonitoring()
  const { center, position, rotation } = getCameraPositionRotation(
    sled !== undefined ? getSledBounds(sled) : getRackBounds()
  )

  const centerRef = useRef(center)

  const defaultCamera = useRef({
    position,
    rotation,
    zoom: sled !== undefined ? defaultSledZoom : defaultRackZoom,
  })

  return (
    <>
      <Canvas orthographic style={{ background: '#101618' }}>
        <ZoomUpdater cameraRef={cameraRef} onZoom={(value) => setZoom(value)} />
        <OrthographicCamera
          makeDefault
          position={defaultCamera.current.position}
          rotation={defaultCamera.current.rotation}
          near={100}
          far={10000}
          zoom={defaultCamera.current.zoom}
          ref={cameraRef}
        />
        <OrbitControls
          makeDefault
          minZoom={minZoom}
          maxZoom={maxZoom}
          rotateSpeed={1}
          target={centerRef.current}
          maxPolarAngle={Math.PI / 2}
        />
        {sled === undefined && (
          <Grid
            cellSize={0.025}
            sectionSize={0.05}
            sectionColor="#373F41"
            scale={100}
            position={[0, -0.5, 0]}
            fadeDistance={1000}
            fadeStrength={0}
          />
        )}
        <SceneInner cameraRef={cameraRef} />
      </Canvas>
    </>
  )
}

const SceneInner = ({
  cameraRef,
}: {
  cameraRef: RefObject<OrthographicCameraType> | undefined
}) => {
  const { setFitSledFn, setFitRackFn } = useMonitoringStore()
  const { sled } = useMonitoring()

  const controls = useThree((state) => state.controls as unknown as ControlsProto)

  useEffect(() => {
    setFitSledFn((index: number) => {
      if (!cameraRef?.current || !controls) {
        return
      }

      fitCameraToTarget(getSledBounds(index), controls, cameraRef.current, defaultSledZoom)
    })

    setFitRackFn(() => {
      if (!cameraRef?.current || !controls) {
        return
      }

      fitCameraToTarget(getRackBounds(), controls, cameraRef.current, defaultRackZoom)
    })
  }, [setFitSledFn, setFitRackFn, cameraRef, controls])

  return (
    <mesh position={[0, sledSize.y / 2, 0]}>
      <Sled visible={sled !== undefined} />
      <Rack visible={sled === undefined} />
    </mesh>
  )
}

type ControlsProto = {
  update(): void
  target: THREE.Vector3
  maxDistance: number
}

const getRackBounds = () => {
  const box = new Box3()
  const fitPosition = new Vec3(0, rackSize.y / 2, 0)
  fitPosition.y = fitPosition.y + sledSize.y / 2
  const size = new Vec3(...Object.values(rackSize))
  box.setFromCenterAndSize(fitPosition, size)

  return box
}

const getSledBounds = (index: number) => {
  const box = new Box3()
  const fitPosition = new Vec3(...getSledPosition(index))
  fitPosition.y = fitPosition.y + sledSize.y / 2
  const size = new Vec3(...Object.values(sledSize))
  box.setFromCenterAndSize(fitPosition, size)

  return box
}

const getCameraPositionRotation = (target: Box3) => {
  // Calculate the center of the target Box3
  const center = new Vec3()
  target.getCenter(center)

  // Calculate the size of the target Box3
  const size = new Vec3()
  target.getSize(size)

  // Determine the maximum dimension of the box to calculate the distance
  const maxDim = Math.max(size.x, size.y, size.z)
  const distance = maxDim * 4

  // Calculate the camera position for an isometric view (45 degrees on Y axis, 35.264 degrees on X axis)
  const position = new Vec3(
    center.x + distance * Math.sqrt(1 / 3),
    center.y + distance * Math.sqrt(1 / 3),
    center.z + distance * Math.sqrt(1 / 3)
  )

  // Isometric rotation
  const rotation = new Euler(-Math.atan(1 / Math.sqrt(2)), Math.PI / 4, 0)

  return { center, position, rotation }
}

const fitCameraToTarget = (
  target: Box3,
  controls: ControlsProto,
  camera: OrthographicCameraType,
  zoom: number
) => {
  const { center, position, rotation } = getCameraPositionRotation(target)

  controls.target = center
  camera.position.set(position.x, position.y, position.z)
  camera.rotation.set(rotation.x, rotation.y, rotation.z)
  camera.zoom = zoom
  camera.updateProjectionMatrix()
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
      {props.visible && (
        <SledHeatmap
          position={[sledSize.x / 2, 0, sledSize.z / 2]}
          scale={[sledSize.x, sledSize.z, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          sensorValues={sensorData}
        />
      )}
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
  const { sensorDataArray } = useMonitoring()

  // An array that gives us 0-31 in a random order
  // We can use this to use a random sensor time for each sled
  // That way we have random data without needing to generate the current data x 32
  const arr = useMemo(() => {
    const array = Array.from({ length: 32 }, (_, index) => index)
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]] // Swap elements
    }
    return array
  }, [])

  const sleds = Array.from({ length: 32 })
  const { sled } = useMonitoring()
  return (
    <mesh name="rack">
      {/* <mesh visible={props.visible}>
        <RackHeatmap
          position={[0, rackSize.y / 2, rackSize.z / 2]}
          scale={[rackSize.x, rackSize.y, 1]}
          rotation={[0, 0, 0]}
          sensorValues={sensorData}
          dimension1="x"
          dimension2="y"
        />
        <RackHeatmap
          position={[rackSize.x / 2, rackSize.y / 2, 0]}
          scale={[rackSize.z, rackSize.y, 1]}
          rotation={[0, Math.PI / 2, 0]}
          sensorValues={sensorData}
          dimension1="z"
          dimension2="y"
        />
        <RackHeatmap
          position={[0, rackSize.y, 0]}
          scale={[rackSize.x, rackSize.z, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          sensorValues={sensorData}
          dimension1="x"
          dimension2="z"
        />
      </mesh> */}
      {sleds.map((_, index) => (
        <RackSled
          key={index}
          position={getSledPosition(index) as Vector3}
          index={index}
          data={sensorDataArray[arr[index]]}
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
  data: SensorValues
}) => {
  const navigate = useNavigate()
  const { fitSled } = useMonitoringStore()
  const { setSelectedComponent } = useMonitoring()

  const { color, isUnhealthy } = useMemo(() => {
    const temperature = generateSensorValue(20, 40, 60)
    const temperatureRange = sensorRanges['air']
    const isUnhealthy = temperature >= temperatureRange[1]

    const noticeColor = new Color('#F5B944')

    const color = isUnhealthy ? noticeColor.toHexString() : '#7E8385'

    return { color, isUnhealthy }
  }, [])

  return (
    <Cube
      position={position}
      scale={Object.values(sledSize) as Vector3}
      selectScaleOffset={2.5}
      // color="#7E8385"
      color={color}
      name={`Sled ${index}`}
      isSelected={false}
      isUnhealthy={isUnhealthy}
      disabled={disabled}
      transparent={!visible}
      handleClick={(e: ThreeEvent<MouseEvent>) => {
        if (disabled) {
          return
        }
        e.stopPropagation()
        navigate(`/system/monitoring/explorer/sleds/${index}`)
        fitSled(index)
        setSelectedComponent(null)
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
      {/* Roughly shrink the box to smaller than the stroke so it doesn't look smaller
         at different angles */}
      <mesh
        scale={addToScale(props.scale || 1, -0.01)}
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

const Fans = () => {
  const { selectedComponent, setSelectedComponent } = useMonitoring()

  return (
    <mesh position={[(sledSize.x / 4) * 2.95, sledSize.y / 2, sledSize.z / 2]}>
      <Cuboid color="#2D3335" scale={[sledSize.x / 10, sledSize.y, sledSize.z]} />
      <Select
        selected={selectedComponent}
        setSelected={(value) => setSelectedComponent(value)}
      >
        {fans.map((fan) => (
          <SpinningFan
            key={fan.label}
            label={fan.label}
            position={Object.values(fan.position) as Vector3}
          />
        ))}
      </Select>
    </mesh>
  )
}

const SpinningFan = ({ label, ...props }: { label: string } & MeshProps) => {
  const { sled, selectedComponent } = useMonitoring()
  const ref = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)

  const disabled = sled === undefined

  const speed = 1

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += speed * delta
    }
  })

  useCursor(hovered)

  useEffect(() => {
    setHover(false)
  }, [sled])

  const isSelected = label === selectedComponent?.label && selectedComponent?.type === 'fan'

  const radius = 0.05
  const length = 0.025

  return (
    <mesh
      position={props.position}
      rotation={[0, 0, -Math.PI / 2]}
      {...props}
      scale={sledSize.x}
      name={`fan ${label}`}
    >
      <mesh ref={ref}>
        <Cylinder radius={radius} length={length} sides={8} color="#2D3335" />
        <mesh
          scale={[radius, length, radius]}
          onPointerOver={
            !disabled ? (e) => (e.stopPropagation(), setHover(true)) : undefined
          }
          onPointerOut={!disabled ? () => setHover(false) : undefined}
        >
          <meshBasicMaterial attach="material" transparent opacity={hovered ? 0.15 : 0.0} />
          <cylinderGeometry attach="geometry" args={[1, 1, 1, 8]} />
        </mesh>

        <Cylinder
          visible={isSelected}
          radius={radius + 0.005}
          length={length}
          sides={8}
          color="#48D597"
        />
      </mesh>
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
  selectedComponent: SelectedComponent | null
}) => {
  const position = [
    data.position.x + data.size.x / 2,
    data.position.y + data.size.y / 2,
    data.position.z + data.size.z / 2,
  ] as Vector3

  const temperature = sensorValues[data.label]
  const temperatureRange = sensorRanges[data.type]
  const isUnhealthy = temperature >= temperatureRange[1]

  const noticeColor = new Color('#F5B944')
  const urgentColor = new Color('#FB6E88')

  const mixPercentage =
    ((temperature - temperatureRange[1]) / (temperatureRange[2] - temperatureRange[1])) *
    100
  const unhealthyColor = noticeColor.mix(urgentColor, mixPercentage)

  const color = isUnhealthy ? unhealthyColor.toHexString() : '#7E8385'

  const isSelected =
    data.label === selectedComponent?.label && selectedComponent?.type === 'sensor'

  return (
    <Cube
      scale={Object.values(data.size) as Vector3}
      position={position}
      name={`sensor ${data.label}`}
      isSelected={isSelected}
      color={color}
      isUnhealthy={isUnhealthy}
    />
  )
}

function addToScale(scale: Vector3, offset: number) {
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale]
  return scaleArray.map((scale) =>
    typeof scale === 'number' ? 1 + (1 / scale) * offset : scale
  ) as [number, number, number]
}
