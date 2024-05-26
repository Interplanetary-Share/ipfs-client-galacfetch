import React, { useState } from 'react'
import {
  indexDbStore,
  TindexDbStore,
  ObjectStoresEnum,
} from '@galacfetch/indexdb'

export const RetrieveDataExample: React.FC = () => {
  const [inputId, setInputId] = useState<string>('')
  const [retrievedData, setRetrievedData] = useState<any>(null)
  const [status, setStatus] = useState<string>('Ready')
  const dbStore: TindexDbStore = indexDbStore()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputId(event.target.value)
  }

  const loadDataById = async () => {
    try {
      // Recuperar los datos usando el ID proporcionado
      const data = await dbStore.getData(inputId, ObjectStoresEnum.files)

      if (data) {
        setRetrievedData(data)
        setStatus('Data retrieved successfully.')
      } else {
        setRetrievedData(null)
        setStatus('No data found for the provided ID.')
      }
    } catch (error) {
      console.error('Error retrieving data:', error)
      setStatus('Error retrieving data.')
    }
  }

  return (
    <div>
      <h2>Retrieve Data from IndexedDB by ID:</h2>
      <input
        type="text"
        value={inputId}
        onChange={handleInputChange}
        placeholder="Enter ID to retrieve data"
      />
      <button onClick={loadDataById}>Retrieve Data</button>
      <p>Status: {status}</p>
      {retrievedData && (
        <div>
          <h3>Data for ID: {inputId}</h3>
          <pre>{JSON.stringify(retrievedData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
