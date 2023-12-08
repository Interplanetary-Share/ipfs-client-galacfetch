import React from 'react'
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient'

export const GetFiles = () => {
  const { getFiles } = ipfsGalactFetchClient()

  const [getFilesResponse, setGetFilesResponse] = React.useState<string>('')
  const [pageNumber, setPageNumber] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [filter, setFilter] = React.useState({
    extraProperties: {
      likes: 'test2',
      ownerID: { $regex: 'me', $options: 'i' },
    },
  })
  const [sort, setSort] = React.useState({
    createdAt: -1,
  })
  const [isPublic, setIsPublic] = React.useState<boolean>(false)

  const [isFilterError, setIsFilterError] = React.useState<boolean>(false)
  const [isSortError, setIsSortError] = React.useState<boolean>(false)

  return (
    <>
      <h2>Get files </h2>
      <h4>config:</h4>
      <div>
        default config:
        <div
          style={{
            width: '350px',
            wordWrap: 'break-word',
            border: '1px solid black',
          }}
        >
          {JSON.stringify({
            showBlobUrl: true,
            showInfoFile: true,
            showExtraProps: true,
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '.5em',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '.5em',
            flexDirection: 'row',
            padding: '1em',
          }}
        >
          <label>isPublic</label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label>Page</label>
          <input
            style={{ width: '40px' }}
            onChange={(e) => {
              setPageNumber(parseInt(e.target.value))
            }}
            type="number"
            placeholder="page"
            value={pageNumber}
          />
          <label>Size</label>
          <input
            style={{ width: '40px' }}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value))
            }}
            type="number"
            placeholder="size"
            value={pageSize}
          />
        </div>

        <label>Filter (In JSON format)</label>
        <textarea
          style={{
            borderColor: isFilterError ? 'red' : 'black',
            backgroundColor: isFilterError
              ? 'rgba(255,0,0,0.3)'
              : 'transparent',
            minHeight: '150px',
          }}
          onInput={(e: any) => {
            const inputValue = e.target.value as string
            if (!inputValue) return setIsFilterError(true)

            // check if JSON.parse would throw an error
            try {
              JSON.parse(inputValue)
            } catch (err) {
              setIsFilterError(true)
              return
            }

            const value = JSON.parse(inputValue)

            if (!value || typeof value !== 'object') {
              setIsFilterError(true)
              return
            }
            setIsFilterError(false)
            setFilter(value)
          }}
          defaultValue={JSON.stringify(filter)}
        />
        <hr />
        <label>Sort (In JSON format)</label>
        <textarea
          style={{
            borderColor: isSortError ? 'red' : 'black',
            backgroundColor: isSortError ? 'rgba(255,0,0,0.3)' : 'transparent',
            minHeight: '100px',
          }}
          onInput={(e: any) => {
            const inputValue = e.target.value as string
            if (!inputValue) return setIsSortError(true)

            // check if JSON.parse would throw an error
            try {
              JSON.parse(inputValue)
            } catch (err) {
              setIsSortError(true)
              return
            }

            const value = JSON.parse(inputValue)

            if (!value || typeof value !== 'object') {
              setIsSortError(true)
              return
            }
            setIsSortError(false)
            setSort(value)
          }}
          defaultValue={JSON.stringify(sort)}
        />
      </div>

      <button
        onClick={async () => {
          getFiles(
            isPublic,
            {
              showBlobUrl: true,
              showInfoFile: true,
              showExtraProps: true,
            },
            {
              page: pageNumber,
              size: pageSize,
              sort,
              filter,
            }
          ).then((props) => {
            setGetFilesResponse(JSON.stringify(props))
          })
        }}
      >
        Get File Info
      </button>

      <div>
        Response:
        <div
          style={{
            width: '300px',
            wordWrap: 'break-word',
          }}
        >
          {getFilesResponse}
        </div>
      </div>
    </>
  )
}
