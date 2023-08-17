import React from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';

export const GetFiles = () => {
  const { getFiles } = ipfsGalactFetchClient();

  const [getFilesResponse, setGetFilesResponse] = React.useState<string>('');
  const [pageNumber, setPageNumber] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [filter, setFilter] = React.useState<object>({});
  const [sort, setSort] = React.useState<object>({});
  const [isPublic, setIsPublic] = React.useState<boolean>(false);

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
        <label>Public</label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <hr />
        <label>Page</label>
        <input
          onChange={(e) => {
            setPageNumber(parseInt(e.target.value));
          }}
          type="number"
          placeholder="page"
          value={pageNumber}
        />
        <hr />
        <label>Size</label>
        <input
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
          }}
          type="number"
          placeholder="size"
          value={pageSize}
        />
        <hr />
        <label>Filter</label>
        <textarea
          onChange={(e) => {
            setFilter(JSON.parse(e.target.value));
          }}
          value={JSON.stringify(filter)}
        />
        <hr />
        <label>Sort</label>
        <textarea
          onChange={(e) => {
            setSort(JSON.parse(e.target.value));
          }}
          value={JSON.stringify(sort)}
        />
      </div>

      <button
        onClick={async () => {
          getFiles(
            false,
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
            setGetFilesResponse(JSON.stringify(props));
          });
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
  );
};
