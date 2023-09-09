import React from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';
import { useEffect } from 'react';

export const InitializeIpfs = () => {
  const { status, init, getFiles } = ipfsGalactFetchClient();

  const [api, setApi] = React.useState<string>('ABC123');
  const [initilized, setInitilized] = React.useState<boolean>(false);

  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [listFiles, setListFiles] = React.useState<any[]>([]);

  useEffect(() => {
    getFiles(
      true,
      {
        showBlobUrl: true,
        showInfoFile: true,
        showExtraProps: true,
      },
      {
        filter: {},
        sort: {},
        page: 1,
        size: 3,
      }
    ).then((res) => {
      setListFiles(res);
    });
    console.log('udpate');
  }, [pageNumber]);

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
          setApi(e.target.value);
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
              setInitilized(true);
              init(api, 'repoName');
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
        This is a Hook, that getFiles when API key detected
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

{listFiles.map((file) => {
            return (
              <div
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
                  src={file.blobUrl}
                  style={{
                    width: '100px',
                    height: '100px',
                  }}
                />
                <label>{file.name}</label>
              </div>
            );
          })
})}

          <label>Page</label>

          <button
            onClick={() => {
              setPageNumber(pageNumber + 1);
            }}
          >
            Next Page
          </button>
          <button
            onClick={() => {
              setPageNumber(pageNumber - 1);
            }}
          >
            Prev Page
          </button>
        </div>
      </div>
      <hr />
    </>
  );
};
