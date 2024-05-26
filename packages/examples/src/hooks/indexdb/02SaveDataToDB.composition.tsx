import React, { useState } from 'react'
import {
  indexDbStore,
  TindexDbStore,
  ObjectStoresEnum,
} from '@galacfetch/indexdb'

export const SaveDataExample: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready')
  const [inputData, setInputData] = useState<string>('')
  const dbStore: TindexDbStore = indexDbStore()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputData(event.target.value)
  }

  const saveData = async () => {
    try {
      // ID y datos a guardar (usamos un ID generado para este ejemplo)
      const id = `id_${new Date().getTime()}`
      const dataToSave = { data: inputData }

      // Guardar los datos en la tabla deseada
      await dbStore.saveData(id, dataToSave, ObjectStoresEnum.files)

      setStatus(`Data saved successfully with ID: ${id}`)
    } catch (error) {
      console.error('Error saving data:', error)
      setStatus('Error saving data.')
    }
  }

  return (
    <div>
      <h2>Save Data to IndexedDB:</h2>
      <input
        type="text"
        value={inputData}
        onChange={handleInputChange}
        placeholder="Enter data to save"
      />
      <button onClick={saveData}>Save Data</button>
      <p>Status: {status}</p>
    </div>
  )
}
