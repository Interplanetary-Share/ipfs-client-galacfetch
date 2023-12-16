import React, { useState, useEffect } from 'react'
import { indexDbStore, TindexDbStore } from '@intershare/hooks.indexdb'

export const IndexDbInitiator: React.FC = () => {
  const [status, setStatus] = useState<string>('Inactive')
  const dbStore: TindexDbStore = indexDbStore()

  useEffect(() => {
    const initDb = async () => {
      try {
        // Database name
        const dbName = 'myDatabase'
        setStatus('Initializing...')
        // Database initialization
        await dbStore.initIndexedDb(dbName)
        setStatus('Database successfully initialized.')
      } catch (error) {
        console.error('Error initializing the database:', error)
        setStatus('Error initializing the database.')
      }
    }

    initDb()
  }, [])

  return (
    <div>
      <h2>IndexedDB Initialization Status:</h2>
      <p>{status}</p>
    </div>
  )
}
