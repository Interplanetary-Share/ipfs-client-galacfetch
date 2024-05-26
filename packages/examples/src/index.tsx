import React from 'react'
import ReactDOM from 'react-dom'
import { IndexDbInitiator } from './hooks/indexdb/01InitDatabase.composition'
import { SaveDataExample } from './hooks/indexdb/02SaveDataToDB.composition'
import { InitializeIndexDB } from './hooks/local-ipfs-file-manager/01InitindexDB.composition'
import { UploadFile } from './hooks/local-ipfs-file-manager/02SaveDataToFileDB.composition'
import './index.css'
import Section from './layout/Section'
import { RetrieveKeysExample } from './hooks/indexdb/03RetrieveAllKeys.composition'
import { RetrieveDataExample } from './hooks/indexdb/04RetrieveData.composition'
import { RetrieveTableStatsExample } from './hooks/indexdb/05GetTableStats.composition'

const App: React.FC = () => {
  return (
    <div>
      <h1>Intershare</h1>
      <Section
        title="IndexDB"
        description="IndexDB is a low-level API for client-side storage of significant amounts of structured data, including files/blobs."
        views={[
          <IndexDbInitiator />,
          <SaveDataExample />,
          <RetrieveKeysExample />,
          <RetrieveDataExample />,
          <RetrieveTableStatsExample />,
        ]}
      />
      <Section
        title="IndexDB"
        description="IndexDB is a low-level API for client-side storage of significant amounts of structured data, including files/blobs."
        views={[<InitializeIndexDB />, <UploadFile />]}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
