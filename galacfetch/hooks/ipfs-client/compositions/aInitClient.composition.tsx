import React from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';

export const InitializeIpfs = () => {
  const { status, init } = ipfsGalactFetchClient();

  const [api, setApi] = React.useState<string>('ABC123');
  const [initilized, setInitilized] = React.useState<boolean>(false);

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
            {status === 'idle' ? <h4>Initialized Properly</h4> : 'loading...'}
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
      <hr />
    </>
  );
};
