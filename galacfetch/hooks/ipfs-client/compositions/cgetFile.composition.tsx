import React from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';

export const GetFile = () => {
  const { getFile } = ipfsGalactFetchClient();

  const [currentCid, setCurrentCid] = React.useState<string>('');
  const [getFileResponse, setGetFileResponse] = React.useState<string>('');

  return (
    <>
      <h2>Get file </h2>
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
      <hr />

      <label>CID of the file : </label>
      <br />
      <input
        type="text"
        onChange={(e) => {
          setCurrentCid(e.target.value);
        }}
      />

      <button
        onClick={async () => {
          getFile(currentCid).then((props) => {
            setGetFileResponse(JSON.stringify(props));
          });
        }}
      >
        Get File Info
      </button>
      <hr />

      <div>
        Response:
        <div
          style={{
            width: '350px',
            wordWrap: 'break-word',
            border: '1px solid black',
          }}
        >
          {getFileResponse}
        </div>
      </div>
    </>
  );
};
