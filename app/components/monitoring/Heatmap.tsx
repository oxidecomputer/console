/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/* eslint-disable react/no-unknown-property */
import { useFrame, type Euler, type Vector3 } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DoubleSide, type CanvasTexture, type Mesh } from 'three'

import { sensors, temperatureRanges, type SensorValues } from './data'

const SledHeatmap = ({
  canvas,
  id,
  sensorValues,
  ...props
}: {
  canvas: React.MutableRefObject<HTMLCanvasElement | null>
  id: string
  position: Vector3
  rotation: Euler
  scale: Vector3
  sensorValues: SensorValues
}) => {
  const heat = useRef<SimpleHeat>()
  const meshRef = useRef<Mesh>(null)
  const textureRef = useRef<CanvasTexture>(null)

  useEffect(() => {
    heat.current = new SimpleHeat(id)
  }, [id])

  useEffect(() => {
    if (!meshRef.current || !heat.current) {
      return
    }

    heat.current.clear()

    for (const sensor of sensors) {
      const temperature = sensorValues[sensor.label]
      heat.current.add({
        x: sensor.position.x,
        y: sensor.position.z,
        width: sensor.size.x,
        height: sensor.size.z,
        value: temperature,
        max: temperatureRanges[sensor.type][2],
        distance: 1,
      })
    }

    heat.current.draw()
  }, [sensorValues, meshRef, heat, id])

  useFrame(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }
  })

  return (
    <mesh {...props} ref={meshRef}>
      <planeGeometry />
      <meshBasicMaterial transparent side={DoubleSide}>
        <canvasTexture
          colorSpace="srgb"
          ref={textureRef}
          attach="map"
          image={canvas.current}
        />
      </meshBasicMaterial>
    </mesh>
  )
}

export { SledHeatmap }

// Based on https://github.com/mourner/simpleheat/blob/gh-pages/simpleheat.js
type Point = {
  x: number
  y: number
  width: number
  height: number
  value: number
  max: number
  distance: number
}
type Gradient = Record<number, string>

class SimpleHeat {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _width: number
  private _height: number
  private _data: Point[]
  private _circle?: HTMLCanvasElement
  private _grad?: Uint8Array

  public defaultGradient: Gradient = {
    0.4: '#4669FF',
    0.6: '#24AB6F',
    0.8: '#FAB122',
    1.0: '#ED3153',
  }

  constructor(canvas: HTMLCanvasElement | string) {
    this._canvas =
      typeof canvas === 'string'
        ? (document.getElementById(canvas) as HTMLCanvasElement)
        : canvas
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D
    this._width = this._canvas.width
    this._height = this._canvas.height
    this._data = []
    this._circle = this._createCanvas()
  }

  data(data: Point[]): this {
    this._data = data
    return this
  }

  add(point: Point): this {
    this._data.push(point)
    return this
  }

  clear(): this {
    this._data = []
    return this
  }

  rectangle(
    width: number,
    height: number,
    value: number,
    max: number,
    distance: number,
    offset: number,
    blur = 15
  ): { size: { width: number; height: number }; canvas: HTMLCanvasElement } {
    // create a grayscale blurred rectangle image that we'll use for drawing points
    const rect = this._circle || this._createCanvas()
    const ctx = rect.getContext('2d') as CanvasRenderingContext2D

    const offsetWidth = offset + width
    const offsetHeight = offset + height

    const size = { width: offsetWidth + blur * 2, height: offsetHeight + blur * 2 }

    rect.width = size.width
    rect.height = size.height

    ctx.clearRect(0, 0, rect.width, rect.height)

    ctx.shadowOffsetX = size.width - blur / 2
    ctx.shadowOffsetY = size.height - blur / 2
    ctx.shadowBlur = blur / 2
    // Using a cubic curve to bias the brightness towards the ends
    const x = Math.min((value / max) * 1, 1)
    const alphaVal = x ** 3
    ctx.shadowColor = `rgba(255, 255, 255,${alphaVal})`
    const cornerRadius = Math.min(offsetWidth, offsetHeight)

    ctx.beginPath()
    // Top left corner
    ctx.moveTo(-offsetWidth - blur + cornerRadius, -offsetHeight - blur)
    // Top right
    ctx.lineTo(-cornerRadius, -offsetHeight - blur)
    ctx.arcTo(0, -offsetHeight - blur, 0, -offsetHeight - blur + cornerRadius, cornerRadius)
    // Bottom right
    ctx.lineTo(0, -cornerRadius)
    ctx.arcTo(0, 0, -cornerRadius, 0, cornerRadius)
    // Bottom left
    ctx.lineTo(-offsetWidth - blur + cornerRadius, 0)
    ctx.arcTo(-offsetWidth - blur, 0, -offsetWidth - blur, -cornerRadius, cornerRadius)
    // Top left
    ctx.lineTo(-offsetWidth - blur, -offsetHeight - blur + cornerRadius)
    ctx.arcTo(
      -offsetWidth - blur,
      -offsetHeight - blur,
      -offsetWidth - blur + cornerRadius,
      -offsetHeight - blur,
      cornerRadius
    )
    ctx.closePath()
    ctx.fill()
    return { size, canvas: rect }
  }

  resize(): void {
    this._width = this._canvas.width
    this._height = this._canvas.height
  }

  draw(): this {
    if (!this._grad) this.gradient(this.defaultGradient)

    const ctx = this._ctx

    ctx.clearRect(0, 0, this._width, this._height)

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (let i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i]

      // Generate circle based on sensor
      const blur = 75
      const offset = 10
      const { size, canvas } = this.rectangle(
        p.width,
        p.height,
        p.value,
        p.max,
        p.distance,
        offset,
        blur
      )

      ctx.globalCompositeOperation = 'lighten'

      ctx.drawImage(
        canvas,
        p.x + p.width / 2 - size.width / 2,
        p.y + p.height / 2 - size.height / 2
      )
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient\
    const colored = ctx.getImageData(0, 0, this._width, this._height)
    this._colorize(new Uint8Array(colored.data.buffer), this._grad as Uint8Array)
    ctx.putImageData(colored, 0, 0)

    return this
  }

  gradient(grad: Gradient): this {
    this._grad = createGradient(grad)
    return this
  }

  private _colorize(pixels: Uint8Array, gradient: Uint8Array): void {
    applyGradient(pixels, gradient)
  }

  private _createCanvas(): HTMLCanvasElement {
    return document.createElement('canvas')
  }
}

export function createGradient(grad: Gradient): Uint8Array {
  // Assuming a 256x1 gradient
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)

  canvas.width = 1
  canvas.height = 256

  for (const i in grad) {
    gradient.addColorStop(+i, grad[i])
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1, 256)

  return new Uint8Array(ctx.getImageData(0, 0, 1, 256).data.buffer)
}

export function getGradientColor(gradient: Uint8Array, value: number) {
  const j = Math.floor(Math.min(value, 1) * 255)

  return [gradient[j], gradient[j + 1], gradient[j + 2]]
}

export function applyGradient(pixels: Uint8Array, gradient: Uint8Array): void {
  for (let i = 0, len = pixels.length; i < len; i += 4) {
    const j = pixels[i + 3] * 4 // get gradient color from opacity value

    if (j) {
      pixels[i] = gradient[j]
      pixels[i + 1] = gradient[j + 1]
      pixels[i + 2] = gradient[j + 2]
    }
  }
}
