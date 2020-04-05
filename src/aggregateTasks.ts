import { task, tree } from 'gulp'
import { Task, TaskFunction } from 'undertaker'

type TaskAggregator = (tasks: Task[]) => TaskFunction

export default (
  aggregateFunc: TaskAggregator,
  prefix: string,
  suffix: string = '',
) => {
  if (prefix.endsWith(':')) {
    prefix = prefix.substring(0, prefix.length - 1)
  }
  if (suffix.startsWith(':')) {
    suffix = suffix.substring(1)
  }
  const searchPrefix = `${prefix}:`
  const searchSuffix = suffix ? `:${suffix}` : ''
  const aggregateTaskMapTasks: Record<string, string[]> = {}
  // @ts-ignore
  const srcTasksNames: string[] = tree().nodes
  srcTasksNames
    .filter(
      (taskName) =>
        taskName.startsWith(searchPrefix) && taskName.endsWith(searchSuffix),
    )
    .forEach((taskName) => {
      const taskParts = taskName
        .substring(searchPrefix.length, taskName.length - searchSuffix.length)
        .split(':')
      for (let i = 0; i < taskParts.length; i++) {
        const aggregateTaskParts = [
          prefix,
          ...taskParts.slice(0, i),
          ...(suffix ? [suffix] : []),
        ]
        const aggregateTaskName = aggregateTaskParts.join(':')
        if (srcTasksNames.includes(aggregateTaskName)) {
          return
        }
        if (aggregateTaskName in aggregateTaskMapTasks) {
          aggregateTaskMapTasks[aggregateTaskName].push(taskName)
        } else {
          aggregateTaskMapTasks[aggregateTaskName] = [taskName]
        }
      }
    })
  Object.entries(aggregateTaskMapTasks).map(([aggregateTaskName, tasks]) => {
    task(aggregateTaskName, aggregateFunc(tasks))
  })
}
