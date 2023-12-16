import React, { useState } from 'react'
import {
  indexDbStore,
  TindexDbStore,
  ObjectStoresEnum,
} from '@intershare/hooks.indexdb'

export const RetrieveKeysExample: React.FC = () => {
  const [keys, setKeys] = useState<IDBValidKey[]>([])
  const [status, setStatus] = useState<string>('Ready')
  const dbStore: TindexDbStore = indexDbStore()

  const loadKeys = async () => {
    try {
      // Cargar todas las claves de una tabla específica
      const loadedKeys = await dbStore.getAllKeys(ObjectStoresEnum.files)

      // Actualizar el estado con las claves cargadas
      if (loadedKeys) {
        setKeys(loadedKeys)
        setStatus('Keys loaded successfully.')
      } else {
        setStatus('No keys found.')
      }
    } catch (error) {
      console.error('Error loading keys:', error)
      setStatus('Error loading keys.')
    }
  }

  return (
    <div>
      <h2>Retrieve All Keys from IndexedDB:</h2>
      <button onClick={loadKeys}>Load Keys</button>
      <p>Status: {status}</p>
      {keys.length > 0 && (
        <ul>
          {keys.map((key, index) => (
            <li key={index}>Key: {key.toString()}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
