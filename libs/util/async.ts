export async function runConcurrent(
  tasks: AsyncGenerator<() => Promise<void>>,
  maxConcurrency: number
): Promise<void> {
  async function processNextTask(): Promise<void> {
    const task = await tasks.next()
    if (task.done) return
    await task.value()
    return processNextTask()
  }

  const workers = new Array(maxConcurrency).fill(null).map(() => processNextTask())
  await Promise.all(workers)
}
