import { useEffect, useState } from 'react'
import { indexDbStore } from '@galacfetch/indexdb'

export const InitializeIndexDB = () => {
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
