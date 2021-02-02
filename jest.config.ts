import { Config } from '@jest/types'

export default {
  setupFilesAfterEnv: ['<rootDir>/testSetup.ts'],
  modulePathIgnorePatterns: ['./packages/web-console/*'],
} as Config.InitialOptions
