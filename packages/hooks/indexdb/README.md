`indexDbStore` is a comprehensive library designed to simplify interactions with IndexedDB in a React application. It provides an easy-to-use API for performing common database operations like initializing the database, CRUD operations, and managing data efficiently with an integrated garbage collector.

[![npm version](https://img.shields.io/npm/v/@galacfetch/indexdb.svg)](https://www.npmjs.com/package/@galacfetch/indexdb)
[![npm downloads](https://img.shields.io/npm/dm/@galacfetch/indexdb.svg)](https://www.npmjs.com/package/@galacfetch/indexdb)
[![GitHub issues](https://img.shields.io/github/issues/Interplanetary-Share/ipfs-client-galacfetch)](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/Interplanetary-Share/ipfs-client-galacfetch)](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/pulls)

## Installation

To install the `indexDbStore` library, run the following command in your project directory:

```bash
npm install @galacfetch/indexdb
```

Or, if you are using `yarn`:

```bash
yarn add @galacfetch/indexdb
```

## Initialization

Before using `indexDbStore`, you need to initialize the IndexedDB database. Here's how you can do it:

```tsx
import { indexDbStore } from '@galacfetch/indexdb'

const dbStore = indexDbStore()
dbStore.initIndexedDb('myDatabaseName')
```

This will create (or open, if it already exists) an IndexedDB database named `'myDatabaseName'`.

## Basic Usage

### Saving Data

To save data to a specific table:

```tsx
const id = 'uniqueId'
const data = { key: 'value' }
dbStore.saveData(id, data, ObjectStoresEnum.files)
```

### Retrieving Data

To retrieve data by ID:

```tsx
const data = await dbStore.getData('uniqueId', ObjectStoresEnum.files)
```

### Removing Data

To remove data by ID:

```tsx
await dbStore.removeData('uniqueId', ObjectStoresEnum.files)
```

## Advanced Features

### Garbage Collector

`indexDbStore` comes with an integrated garbage collector to manage storage space efficiently. The garbage collector can be configured as follows:

```tsx
dbStore.setConfig({
  maxSizeByTable: 1000000, // Max size in bytes
  garbageCollector: {
    enabled: true,
    interval: 60000, // Interval in milliseconds
    strategy: 'lru', // Currently, only 'lru' (Least Recently Used) strategy is implemented
  },
})
```

This configuration enables the garbage collector, which will run every 60 seconds and ensure that the size of each table does not exceed 1MB, based on the 'Least Recently Used' strategy.

### Types

`indexDbStore` uses several TypeScript types for better code management and error handling:

- `TindexDbStore`: Main store type.
- `ObjectStoresEnum`: Enumeration type for table names.
- `TConfig`: Configuration type for the store and garbage collector.

## Examples

### Initializing Database

```tsx
// Example component to initialize the IndexedDB
import React from 'react'
import { indexDbStore } from '@galacfetch/indexdb'

const DatabaseInitializer: React.FC = () => {
  const dbStore = indexDbStore()
  dbStore.initIndexedDb('myDatabase')

  return <div>Database Initialized</div>
}

export default DatabaseInitializer
```

### Saving and Retrieving Data

```tsx
// Example component to save and retrieve data
import React, { useState } from 'react'
import { indexDbStore, ObjectStoresEnum } from '@galacfetch/indexdb'

const DataHandler: React.FC = () => {
  const [data, setData] = useState(null)
  const dbStore = indexDbStore()

  const saveData = async () => {
    await dbStore.saveData(
      'myId',
      { sampleData: 'Hello' },
      ObjectStoresEnum.files
    )
    alert('Data Saved')
  }

  const loadData = async () => {
    const retrievedData = await dbStore.getData('myId', ObjectStoresEnum.files)
    setData(retrievedData)
  }

  return (
    <div>
      <button onClick={saveData}>Save Data</button>
      <button onClick={loadData}>Load Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

export default DataHandler
```

## Additional Methods in `indexDbStore`

### Retrieving All Keys

The `getAllKeys` method allows you to retrieve all the keys from a specific table in the IndexedDB. This can be useful for scenarios where you need to list or iterate over all entries in a table.

#### Usage Example

```tsx
// Example component to retrieve all keys from a table
import React, { useState } from 'react'
import { indexDbStore, ObjectStoresEnum } from '@galacfetch/indexdb'

const AllKeysRetriever: React.FC = () => {
  const [keys, setKeys] = useState<IDBValidKey[]>([])
  const dbStore = indexDbStore()

  const loadAllKeys = async () => {
    const allKeys = await dbStore.getAllKeys(ObjectStoresEnum.files)
    setKeys(allKeys || [])
  }

  return (
    <div>
      <button onClick={loadAllKeys}>Load All Keys</button>
      <ul>
        {keys.map((key, index) => (
          <li key={index}>{key.toString()}</li>
        ))}
      </ul>
    </div>
  )
}

export default AllKeysRetriever
```

### Getting Table Statistics

The `getTableStats` method provides statistics for a specified table in the database, such as the total size of the table in bytes. This can be particularly useful for monitoring the database's size and managing storage efficiently.

#### Usage Example

```tsx
// Example component to get stats of a table
import React, { useState } from 'react'
import { indexDbStore, ObjectStoresEnum } from '@galacfetch/indexdb'

const TableStatsViewer: React.FC = () => {
  const [stats, setStats] = useState<number | null>(null)
  const dbStore = indexDbStore()

  const loadStats = async () => {
    const tableStats = await dbStore.getTableStats(ObjectStoresEnum.files)
    setStats(tableStats?.size || null)
  }

  return (
    <div>
      <button onClick={loadStats}>Load Table Stats</button>
      {stats !== null && <p>Size of 'files' table: {stats} bytes</p>}
    </div>
  )
}

export default TableStatsViewer
```

### Garbage Collection

The `indexDbStore` library includes a garbage collection feature to help manage data storage efficiently. The garbage collector ensures that the size of each table does not exceed a specified limit, removing older entries based on a specified strategy.

#### Configuring the Garbage Collector

You can configure the garbage collector by setting the `maxSizeByTable` and `garbageCollector` properties in the configuration. The `garbageCollector` object includes properties such as `enabled`, `interval`, and `strategy`.

#### Usage Example

```tsx
dbStore.setConfig({
  maxSizeByTable: 500000, // Maximum size in bytes
  garbageCollector: {
    enabled: true,
    interval: 30000, // Interval in milliseconds
    strategy: 'lru', // 'lru' - Least Recently Used
  },
})
```

This configuration will enable the garbage collector, which runs every 30 seconds and ensures the size of each table does not exceed 500KB, using the 'Least Recently Used' strategy.

## Contributing to `indexDbStore`

We welcome contributions to the `indexDbStore` library! Whether it's improving the code, fixing bugs, or adding new features, your input is valuable. Here's how you can contribute:

### GitHub Repository

Our code is hosted on GitHub. Visit our repository to view the source code, fork the project, or submit a pull request:

🔗 [ipfs-client-galacfetch on GitHub](https://github.com/Interplanetary-Share/ipfs-client-galacfetch)

### Submitting Pull Requests

Have a suggestion or a bug fix? We encourage you to submit a pull request:

🔗 [Submit a Pull Request](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/pulls)

Please ensure your code adheres to the project's coding standards and include tests for new functionality.

### Reporting Issues

Encountered a bug or have a feature request? Open an issue on our GitHub page:

🔗 [Report an Issue](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/issues)

Provide as much information as possible, such as steps to reproduce the bug and the expected behavior.

### npm Package

`indexDbStore` is available as an npm package. You can find it here for easy installation and updates:

🔗 [indexDbStore on npm](https://www.npmjs.com/package/@galacfetch/indexdb)

### Contact

For direct inquiries or specific concerns, feel free to reach via email at kenneth@interplanetaryshare.com.
