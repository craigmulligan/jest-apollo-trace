import { toNotRegress } from './'
import times from 'lodash/times'
import { GraphQLClient } from 'graphql-request'

expect.extend({ toNotRegress })

const client = new GraphQLClient('https://fakerql.com/graphql', {
  headers: {
    'x-apollo-tracing': 1
  }
})

test('Query.allUsers', async () => {
  // do 50 reqs
  // .toNotRegress will avg out the traces
  const reqs = times(50, () =>
    client.rawRequest(`{
        allUsers {
          id
        }
      }`)
  )

  const data = await Promise.all(reqs)
  expect(data).toNotRegress({ failureThreshold: 10 })
})
