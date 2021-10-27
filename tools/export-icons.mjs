// This script requires FIGMA_TOKEN to be defined. It'll be automatically read from a .env file if present.

import { fs, path, globby, $ } from 'zx'

const files = globby.globbyStream

// Load dotenv
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envs = fs
    .readFileSync(envPath, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter((line) => line)

  for (const env of envs) {
    const [envName, ...envParts] = env.split('=')
    const envValue = envParts.join('=')
    process.env[envName] = envValue
  }
}

await $`rm -rf libs/ui/lib/icons`
await $`figma-export use-config`

for await (const file of files('libs/ui/lib/icons/**/*.js')) {
  await fs.rename(file, file.replace('.js', '.ts'))
}

for await (const file of files('codemods/*.icons.js')) {
  await $`npx jscodeshift -t ${file} --extensions=ts,tsx --parser=tsx './libs/ui/lib/icons'`
}

await $`yarn fmt`
