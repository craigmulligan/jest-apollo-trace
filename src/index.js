import kebabCase from 'lodash/kebabCase'
import _ from 'lodash'
import path from 'path'

import diffTraceToSnapShot from './diff-snapshot'
import avg from './avg'

const isString = str => typeof str === 'string'
const SNAPSHOTS_DIR = '__TRACE_SNAPSHOTS__'

function updateSnapshotState(oldSnapshotState, newSnapshotState) {
  return _.merge({}, oldSnapshotState, newSnapshotState)
}

export function toNotRegress(recieved, { failureThreshold } = {}) {
  const traceData = avg(recieved)

  if (!traceData) {
    throw new Error('No tracing data was provided with the response')
  }

  let { snapshotState } = this
  const { testPath, currentTestName } = this

  updateSnapshotState(snapshotState, {
    _counters: snapshotState._counters.set(
      currentTestName,
      (snapshotState._counters.get(currentTestName) || 0) + 1
    )
  })

  const snapshotIdentifier = kebabCase(
    `${path.basename(testPath)}-${currentTestName}-${snapshotState._counters.get(currentTestName)}`
  )

  const result = diffTraceToSnapShot({
    traceData,
    failureThreshold,
    snapshotIdentifier,
    snapshotsDir: path.join(path.dirname(testPath), SNAPSHOTS_DIR),
    updateSnapshot: snapshotState._updateSnapshot === 'all'
  })

  let pass = true
  let message = () => ''

  if (result.updated) {
    snapshotState = updateSnapshotState(snapshotState, { updated: (snapshotState.updated += 1) })
  } else if (result.added) {
    snapshotState = updateSnapshotState(snapshotState, { added: (snapshotState.added += 1) })
  } else {
    ;({ pass } = result)

    if (!pass) {
      const differencePercentage = '5'
      const print = regression =>
        `Expected execution times fluctuate by ${failureThreshold}% but the fluctuation was ${
          regression.percentDiff
        }%`

      message = () => result.regressions.map(print).join('/n')
    }
  }

  return {
    message,
    pass
  }
}
