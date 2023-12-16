import React, { useState } from 'react'
import {
  indexDbStore,
  TindexDbStore,
  ObjectStoresEnum,
} from '@intershare/hooks.indexdb'

export const RetrieveTableStatsExample: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<ObjectStoresEnum | ''>('')
  const [tableStats, setTableStats] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('Ready')
  const dbStore: TindexDbStore = indexDbStore()

  const handleTableChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(event.target.value as ObjectStoresEnum)
  }

  const loadTableStats = async () => {
    if (!selectedTable) {
      setStatus('Please select a table first.')
      return
    }

    try {
      const stats = await dbStore.getTableStats(selectedTable)
      if (stats) {
        setTableStats(stats.size)
        setStatus(`Stats for table '${selectedTable}' loaded successfully.`)
      } else {
        setTableStats(null)
        setStatus(`No stats found for table '${selectedTable}'.`)
      }
    } catch (error) {
      console.error('Error loading table stats:', error)
      setStatus('Error loading table stats.')
    }
  }

  return (
    <div>
      <h2>Retrieve Table Stats from IndexedDB:</h2>
      <select value={selectedTable} onChange={handleTableChange}>
        <option value="">Select a Table</option>
        {Object.values(ObjectStoresEnum).map((table, index) => (
          <option key={index} value={table}>
            {table}
          </option>
        ))}
      </select>
      <button onClick={loadTableStats}>Load Stats</button>
      <p>Status: {status}</p>
      {tableStats !== null && (
        <p>
          Size of '{selectedTable}' table: {tableStats} bytes
        </p>
      )}
    </div>
  )
}
