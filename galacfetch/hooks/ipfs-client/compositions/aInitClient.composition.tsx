import { useEffect, useState } from 'react'

import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient'

export const InitializeIpfs = () => {
  const { status, init, getFiles } = ipfsGalactFetchClient()
  const [api, setApi] = useState<string>('ABC123')
  const [initilized, setInitilized] = useState<boolean>(false)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [listFiles, setListFiles] = useState<any[]>([])
  const [isPublic, setIsPublic] = useState<boolean>(false)

  useEffect(() => {
    getFiles(
      isPublic,
      {
        showBlobUrl: true,
        showInfoFile: true,
        showExtraProps: true,
      },
      {
        filter: {},
        sort: {},
        page: pageNumber,
        size: 3,
      }
    ).then((res) => {
      setListFiles(res)
    })
  }, [pageNumber, isPublic])

  return (
    <>
      <h2>Initialize IPFS</h2>
      <label>Introduce your API and initilize the IPFS</label>
      <input
        style={{
          width: '100%',
        }}
        type="text"
        value={api}
        onChange={(e) => {
          setApi(e.target.value)
        }}
      />
      <div
        style={{
          padding: '1em',
        }}
      >
        {status && initilized ? (
          <>
            {status === 'idle' ? <h3>Initialized Properly</h3> : 'loading...'}
          </>
        ) : (
          <button
            onClick={() => {
              setInitilized(true)
              init(api, 'repoName')
            }}
          >
            Initialize IPFS
          </button>
        )}
        <hr />
        <a href="https://galacfetch.com/" target="_blank">
          Get your API key here
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>This is a Hook, that getFiles when API key detected</h3>
        <div>
          isPublic?
          <input
            type="checkbox"
            defaultChecked={isPublic}
            onChange={(e) => {
              setIsPublic(e.target.checked)
            }}
          />
        </div>
        {listFiles.map((file, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '.5em',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={file.url}
                style={{
                  width: '100px',
                  height: '100px',
                }}
              />
              <label>{file.name}</label>
            </div>
          )
        })}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '.5em',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => {
              setPageNumber(pageNumber - 1)
            }}
          >
            Prev Page
          </button>
          <label>Page {pageNumber} </label>
          <button
            onClick={() => {
              setPageNumber(pageNumber + 1)
            }}
          >
            Next Page
          </button>
        </div>
      </div>
      <hr />
    </>
  )
}
