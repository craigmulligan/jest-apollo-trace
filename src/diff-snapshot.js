import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import get from 'lodash/get'
import compact from 'lodash/compact'
import isObject from 'lodash/isObject'
import flatten from 'lodash/flatten'
import _ from 'lodash'

const percentDiff = (prev, current) => {
  const diff = prev - current
  return diff / prev * 100
}

const Compare = (regressions, hasRegressed) => vals => {
  const prev = vals[0]
  const current = vals[1]
  if (hasRegressed(_.get(prev, 'duration'))(_.get(current, 'duration'))) {
    regressions.push({
      path: prev.path || 'total',
      percentDiff: percentDiff(prev.duration, current.duration),
      prev: prev.duration,
      current: current.duration,
      diff: current.duration - prev.duration
    })
  }
}

function diffTraceToSnapShot(options) {
  const {
    traceData,
    tracePaths = [''],
    failureThreshold = 10,
    snapshotIdentifier,
    snapshotsDir,
    updateSnapshot = false
  } = options

  const baselineSnapshotPath = path.join(snapshotsDir, `${snapshotIdentifier}-snap.json`)

  if (fs.existsSync(baselineSnapshotPath) && !updateSnapshot) {
    const regressions = []
    const prevTrace = require(baselineSnapshotPath)

    const compare = Compare(regressions, prev => current => {
      const p = percentDiff(prev, current)
      if (p < -failureThreshold) {
        return true
      } else {
        return false
      }
    })
    // root comparision
    compare([traceData, prevTrace])

    // resolvers
    // TODO: Currently can't get resolve paths to return reliable values, percentage diffs, can be anywhere from 5% to 200%
    // Need to figure out if that's inherent of something needs fixing
    /* _([_.get(prevTrace, 'execution.resolvers'), _.get(traceData, 'execution.resolvers')]) */
    // .flatten()
    // .groupBy('path')
    // .map(compare)
    /* .value() */

    return {
      pass: regressions.length === 0,
      regressions
    }
  } else {
    mkdirp.sync(snapshotsDir)
    fs.writeFileSync(baselineSnapshotPath, JSON.stringify(traceData, null, 2))

    return updateSnapshot ? { updated: true } : { added: true }
  }
}

export default diffTraceToSnapShot
