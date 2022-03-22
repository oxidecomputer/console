# `operator-mode` Theme

This document shows the relationship of colors within the `operator-mode` theme.

## base-green-500

```mermaid
graph RL
  base-green-500 --> #48d597:::base-green-500
  theme-success-1 --> base-green-500
  surface-success --> theme-success-1
  content-success --> theme-success-1
  stroke-success --> theme-success-1

  classDef base-green-500 stroke-width:5,stroke:#48d597
```

## base-green-600

```mermaid
graph RL
  base-green-600 --> #2e8160:::base-green-600
  theme-success-2 --> base-green-600
  chart-stroke-line-secondary --> base-green-600
  content-success-secondary --> theme-success-2

  classDef base-green-600 stroke-width:5,stroke:#2e8160
```

## base-green-700

```mermaid
graph RL
  base-green-700 --> #1e5140:::base-green-700
  theme-success-3 --> base-green-700
  stroke-success-secondary --> theme-success-3

  classDef base-green-700 stroke-width:5,stroke:#1e5140
```

## base-green-800

```mermaid
graph RL
  base-green-800 --> #16362e:::base-green-800
  theme-success-4 --> base-green-800
  stroke-success-tertiary --> theme-success-4

  classDef base-green-800 stroke-width:5,stroke:#16362e
```

## base-green-900

```mermaid
graph RL
  base-green-900 --> #102422:::base-green-900
  theme-success-5 --> base-green-900
  surface-success-secondary --> theme-success-5

  classDef base-green-900 stroke-width:5,stroke:#102422
```

## base-yellow-500

```mermaid
graph RL
  base-yellow-500 --> #f5cf65:::base-yellow-500
  theme-accent-1 --> base-yellow-500
  theme-notice-1 --> base-yellow-500
  surface-accent --> theme-accent-1
  surface-notice --> theme-notice-1
  content-accent --> theme-accent-1
  content-notice --> theme-notice-1
  stroke-accent --> theme-accent-1
  stroke-notice --> theme-notice-1

  classDef base-yellow-500 stroke-width:5,stroke:#f5cf65
```

## base-yellow-600

```mermaid
graph RL
  base-yellow-600 --> #8f7e44:::base-yellow-600
  theme-accent-2 --> base-yellow-600
  theme-notice-2 --> base-yellow-600
  chart-stroke-line --> theme-accent-2
  chart-fill-item-primary --> theme-accent-2
  surface-accent-hover --> theme-accent-2
  surface-notice-hover --> theme-notice-2
  content-accent-secondary --> theme-accent-2
  content-notice-secondary --> theme-notice-2

  classDef base-yellow-600 stroke-width:5,stroke:#8f7e44
```

## base-yellow-700

```mermaid
graph RL
  base-yellow-700 --> #554f30:::base-yellow-700
  theme-accent-3 --> base-yellow-700
  theme-notice-3 --> base-yellow-700
  chart-fill-item-secondary --> theme-accent-3
  content-accent-tertiary --> theme-accent-3
  content-accent-disabled --> theme-accent-3
  content-notice-tertiary --> theme-notice-3
  content-notice-disabled --> theme-notice-3
  stroke-accent-secondary --> theme-accent-3
  stroke-notice-secondary --> theme-notice-3

  classDef base-yellow-700 stroke-width:5,stroke:#554f30
```

## base-yellow-800

```mermaid
graph RL
  base-yellow-800 --> #343526:::base-yellow-800
  theme-accent-4 --> base-yellow-800
  theme-notice-4 --> base-yellow-800
  chart-fill-item-tertiary --> theme-accent-4
  surface-accent-raise --> theme-accent-4
  surface-accent-secondary-hover --> theme-accent-4
  surface-notice-raise --> theme-notice-4
  surface-notice-secondary-hover --> theme-notice-4
  stroke-accent-tertiary --> theme-accent-4
  stroke-notice-tertiary --> theme-notice-4

  classDef base-yellow-800 stroke-width:5,stroke:#343526
```

## base-yellow-900

```mermaid
graph RL
  base-yellow-900 --> #1e231e:::base-yellow-900
  theme-accent-5 --> base-yellow-900
  theme-notice-5 --> base-yellow-900
  chart-fill-item-quaternary --> theme-accent-5
  surface-accent-secondary --> theme-accent-5
  surface-notice-secondary --> theme-notice-5

  classDef base-yellow-900 stroke-width:5,stroke:#1e231e
```

## base-red-500

```mermaid
graph RL
  base-red-500 --> #e86886:::base-red-500
  theme-destructive-1 --> base-red-500
  theme-error-1 --> base-red-500
  surface-destructive --> theme-destructive-1
  surface-error --> theme-error-1
  content-destructive --> theme-destructive-1
  content-error --> theme-error-1
  stroke-destructive --> theme-destructive-1
  stroke-error --> theme-error-1

  classDef base-red-500 stroke-width:5,stroke:#e86886
```

## base-red-600

```mermaid
graph RL
  base-red-600 --> #884456:::base-red-600
  theme-destructive-2 --> base-red-600
  theme-error-2 --> base-red-600
  chart-stroke-line-tertiary --> base-red-600
  chart-fill-error-primary --> theme-destructive-2
  surface-destructive-hover --> theme-destructive-2
  content-destructive-secondary --> theme-destructive-2
  content-error-secondary --> theme-error-2

  classDef base-red-600 stroke-width:5,stroke:#884456
```

## base-red-700

```mermaid
graph RL
  base-red-700 --> #512f3b:::base-red-700
  theme-destructive-3 --> base-red-700
  theme-error-3 --> base-red-700
  chart-fill-error-secondary --> theme-destructive-3
  content-destructive-tertiary --> theme-destructive-3
  content-destructive-disabled --> theme-destructive-3
  stroke-destructive-secondary --> theme-destructive-3
  stroke-error-secondary --> theme-error-3

  classDef base-red-700 stroke-width:5,stroke:#512f3b
```

## base-red-800

```mermaid
graph RL
  base-red-800 --> #32232b:::base-red-800
  theme-destructive-4 --> base-red-800
  theme-error-4 --> base-red-800
  chart-fill-error-tertiary --> theme-destructive-4
  surface-destructive-raise --> theme-destructive-4
  surface-destructive-secondary-hover --> theme-destructive-4
  stroke-destructive-tertiary --> theme-destructive-4
  stroke-error-tertiary --> theme-error-4

  classDef base-red-800 stroke-width:5,stroke:#32232b
```

## base-red-900

```mermaid
graph RL
  base-red-900 --> #1d1b21:::base-red-900
  theme-destructive-5 --> base-red-900
  theme-error-5 --> base-red-900
  chart-fill-error-quaternary --> theme-destructive-5
  surface-destructive-secondary --> theme-destructive-5
  surface-error-secondary --> theme-error-5

  classDef base-red-900 stroke-width:5,stroke:#1d1b21
```

## base-blue-500

```mermaid
graph RL
  base-blue-500 --> #4969f6:::base-blue-500

  classDef base-blue-500 stroke-width:5,stroke:#4969f6
```

## base-blue-600

```mermaid
graph RL
  base-blue-600 --> #2e4496:::base-blue-600
  chart-stroke-line-quaternary --> base-blue-600

  classDef base-blue-600 stroke-width:5,stroke:#2e4496
```

## base-blue-700

```mermaid
graph RL
  base-blue-700 --> #1f2f5f:::base-blue-700

  classDef base-blue-700 stroke-width:5,stroke:#1f2f5f
```

## base-blue-800

```mermaid
graph RL
  base-blue-800 --> #16233f:::base-blue-800

  classDef base-blue-800 stroke-width:5,stroke:#16233f
```

## base-blue-900

```mermaid
graph RL
  base-blue-900 --> #101b2a:::base-blue-900

  classDef base-blue-900 stroke-width:5,stroke:#101b2a
```

## base-grey-500

```mermaid
graph RL
  base-grey-500 --> #e7e7e8:::base-grey-500
  surface-inverse --> content-default
  content-default --> base-grey-500

  classDef base-grey-500 stroke-width:5,stroke:#e7e7e8
```

## base-grey-600

```mermaid
graph RL
  base-grey-600 --> #9ea1a3:::base-grey-600
  surface-inverse-secondary --> content-secondary
  content-secondary --> base-grey-600

  classDef base-grey-600 stroke-width:5,stroke:#9ea1a3
```

## base-grey-700

```mermaid
graph RL
  base-grey-700 --> #6c7174:::base-grey-700
  surface-inverse-tertiary --> content-tertiary
  content-tertiary --> base-grey-700
  stroke-raise --> base-grey-700

  classDef base-grey-700 stroke-width:5,stroke:#6c7174
```

## base-grey-800

```mermaid
graph RL
  base-grey-800 --> #4b5255:::base-grey-800

  classDef base-grey-800 stroke-width:5,stroke:#4b5255
```

## base-grey-900

```mermaid
graph RL
  base-grey-900 --> #353c40:::base-grey-900
  content-quaternary --> base-grey-900
  stroke-default --> base-grey-900

  classDef base-grey-900 stroke-width:5,stroke:#353c40
```

## base-grey-1000

```mermaid
graph RL
  base-grey-1000 --> #252d31:::base-grey-1000
  chart-stroke-item-inactive --> base-grey-1000
  surface-secondary-hover --> base-grey-1000
  stroke-secondary --> base-grey-1000

  classDef base-grey-1000 stroke-width:5,stroke:#252d31
```

## base-black-500

```mermaid
graph RL
  base-black-500 --> #182024:::base-black-500
  surface-secondary --> base-black-500
  surface-disabled --> base-black-500
  content-inverse-secondary --> surface-secondary
  stroke-tertiary --> base-black-500

  classDef base-black-500 stroke-width:5,stroke:#182024
```

## base-black-550

```mermaid
graph RL
  base-black-550 --> #0E1A1F:::base-black-550
  surface-raise-hover --> base-black-550

  classDef base-black-550 stroke-width:5,stroke:#0E1A1F
```

## base-black-600

```mermaid
graph RL
  base-black-600 --> #0b1418:::base-black-600
  chart-fill-inactive --> base-black-600
  surface-raise --> base-black-600

  classDef base-black-600 stroke-width:5,stroke:#0b1418
```

## base-black-700

```mermaid
graph RL
  base-black-700 --> #080f11:::base-black-700
  surface-default --> base-black-700
  content-inverse --> surface-default
  stroke-surface --> surface-default

  classDef base-black-700 stroke-width:5,stroke:#080f11
```
