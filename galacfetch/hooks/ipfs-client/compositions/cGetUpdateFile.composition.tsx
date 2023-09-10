import React, { useEffect } from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';
import { IFileRetrievalResponse } from '../types/file';

export const GetAndUpdateFile = () => {
  const { getFile, updateFile } = ipfsGalactFetchClient();

  const [currentCid, setCurrentCid] = React.useState<string>('');
  const [getFileResponse, setGetFileResponse] = React.useState<
    IFileRetrievalResponse | undefined
  >();
  const [editFile, setEditFile] = React.useState<string>('');

  useEffect(() => {
    const { name, description, isPublic, extraProperties } =
      getFileResponse || {};

    setEditFile(
      JSON.stringify({ name, description, isPublic, extraProperties })
    );
  }, [getFileResponse]);

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
            setGetFileResponse(props);
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
          {JSON.stringify(getFileResponse)}
        </div>
      </div>

      <h2>Edit File</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '.5em',
        }}
      >
        <label>editConfig: </label>
        <textarea
          value={editFile}
          onChange={(e) => {
            setEditFile(e.target.value);
          }}
        />

        <button
          onClick={() => {
            const editFileJson = JSON.parse(editFile);
            updateFile(currentCid, editFileJson);
          }}
        >
          Edit File
        </button>
      </div>
    </>
  );
};
