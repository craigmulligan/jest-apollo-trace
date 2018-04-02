import _ from 'lodash'

export default received => {
  if (!_.isArray(received)) {
    return _.get(received, 'data.extensions.tracing')
  }

  const traceData = received.map(data => _.get(data, 'extensions.tracing'))

  return {
    duration: _.meanBy(traceData, 'duration'),
    parsing: _.meanBy(_.get(traceData, 'parsing'), 'duration'),
    validation: _.meanBy(_.get(traceData, 'validation'), 'duration'),
    execution: {
      resolvers: _(traceData)
        .map(data => _.get(data, 'execution.resolvers'))
        .flatten()
        .groupBy('path')
        .map((arr, k) => {
          return {
            path: arr[0].path,
            duration: _.meanBy(arr, 'duration')
          }
        })
        .value()
    }
  }
}
