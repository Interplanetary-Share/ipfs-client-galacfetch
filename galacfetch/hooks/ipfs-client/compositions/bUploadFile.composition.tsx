import React from 'react';
import { ipfsGalactFetchClient } from '../ipfsGalactFetchClient';

export const UploadFile = () => {
  const { uploadFile, urlFileList } = ipfsGalactFetchClient();

  const [uploadConfig, setUploadConfig] = React.useState<string>(
    JSON.stringify({
      name: 'fileNameTest',
      description: 'DescriptionTest',
      extraProperties: { likes: ['test2', 'another'], ownerID: 'me' },
      isPublic: false,
    })
  );

  return (
    <>
      <div
        style={{
          padding: '1em',
        }}
      >
        <h2>Upload File</h2>
        <div>
          Config:
          <div
            style={{
              width: '300px',
              wordWrap: 'break-word',
            }}
          >
            <textarea
              style={{
                width: '100%',
                height: '100px',
              }}
              onChange={(e) => setUploadConfig(e.target.value)}
              value={uploadConfig}
            />
          </div>
        </div>
        <input
          type="file"
          onChange={(e) => {
            if (!e.target.files) return console.log('error no file selected');
            const file = e.target.files[0];
            uploadFile(file, JSON.parse(uploadConfig));
            e.target.value = '';
          }}
        />
      </div>
      <hr />
      <div
        style={{
          padding: '1em',
        }}
      >
        <h4>Preloaded Files</h4>
        {urlFileList.map((urlFile: any, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
                wordWrap: 'break-word',
                border: '1px solid black',
              }}
            >
              <div>blobUrl: {urlFile.url}</div>
              <hr />
              <div>cid: {urlFile.cid}</div>
            </div>
          );
        })}
      </div>
      <hr />
    </>
  );
};
