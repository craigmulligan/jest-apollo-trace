# jest-apollo-trace

> test regressions on graphql queries by making assertions against [apollo tracing data](https://github.com/apollographql/apollo-tracing)

* Works with any server that returns [apollo-tracing-format](https://github.com/apollographql/apollo-tracing#supported-graphql-servers)
* Stores snapshots of past tracing results
* handles multipe responses and calculates the average for each resolver path
* Checks the for regressions with saved snapshot on each resolver path

# Usage

```javascript
import { toNotRegress } from 'jest-apollo-trace'
import times from 'lodash/times'
import { GraphQLClient } from 'graphql-request'

expect.extend({ toNotRegress })

const client = new GraphQLClient('https://fakerql.com/graphql', {
  headers: {
    'x-apollo-tracing': 1
  }
})

test('Query.allUsers', async () => {
  // Do 50 reqs
  // .toNotRegress() will avg out the traces
  const reqs = times(10, () =>
    client.rawRequest(`{
        allUsers {
          id
        }
      }`)
  )

  const data = await Promise.all(reqs)

  expect(data).toNotRegress({ failureThreshold: 10 // 10% fluctuation threshold })
})
```

Inspired by [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)
