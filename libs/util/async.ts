export async function runConcurrent(
  tasks: AsyncGenerator<() => Promise<void>>,
  maxConcurrency: number
): Promise<void> {
  const counts = new Array(maxConcurrency).fill(0)

  async function processNextTask(i: number): Promise<void> {
    const task = await tasks.next()
    if (task.done) return

    await task.value()
    counts[i]++
    console.log('chunks processed by each thread', counts)

    return processNextTask(i)
  }

  const workers = new Array(maxConcurrency).fill(null).map((_, i) => processNextTask(i))
  await Promise.all(workers)
}
