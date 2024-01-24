import React, { useEffect, useState } from 'react'
import { indexDbStore } from '@intershare/hooks.indexdb'

export const initializeIndexDB: React.FC = () => {
  const dbName = 'myDatabase'
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    indexDbStore
      .getState()
      .initIndexedDb(dbName)
      .then(() => setIsInitialized(true))
      .catch(() => setIsInitialized(false))
  }, [dbName])

  return (
    <div>
      <>Indexed DB is initialized: {isInitialized ? 'true' : 'false'}</>
    </div>
  )
}
