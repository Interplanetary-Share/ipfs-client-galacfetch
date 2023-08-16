import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLocalIpfsStore } from './useLocalIpfsStore';
import { fileToBlobUrl } from './utils/file';
import { useRemoteIpfsClient } from './useRemoteIpfsClient';
import { ipfsGalactFetchClient } from './ipfsGalactFetchClient';
export const BasicipfsClient = () => {
  const { status, init, getFile, getFiles, uploadFile, urlFileList } =
    ipfsGalactFetchClient();

  const [api, setApi] = React.useState<string>('ABC123');
  const [currentCid, setCurrentCid] = React.useState<string>('');
  const [getFileResponse, setGetFileResponse] = React.useState<string>('');
  const [uploadConfig, setUploadConfig] = React.useState<string>(
    JSON.stringify({
      name: 'fileNameTest',
      description: 'DescriptionTest',
      extraProperties: { likes: ['test2', 'another'], ownerID: 'me' },
    })
  );

  const [initilized, setInitilized] = React.useState<boolean>(false);

  return (
    <>
      <Helmet>
        <script src="https://cdn.jsdelivr.net/npm/ipfs-core/dist/index.min.js"></script>
      </Helmet>

      <br />
      <label>Introduce your API and initilize the IPFS</label>
      <input
        style={{
          width: '100%',
        }}
        type="text"
        value={api}
        onChange={(e) => {
          setApi(e.target.value);
          setInitilized(true);
        }}
      />
      <div
        style={{
          padding: '1em',
        }}
      >
        <label>Click to Initialize IPFS </label>
        {status && initilized ? (
          <h4>Initialized Properly</h4>
        ) : (
          <button onClick={() => init(api, 'repoName')}>
            Init(token,name)
          </button>
        )}
      </div>
      <hr />

      <div
        style={{
          padding: '1em',
        }}
      >
        <h4>Upload File</h4>
        <div>
          Config:
          <div
            style={{
              width: '300px',
              wordWrap: 'break-word',
            }}
          >
            <textarea onChange={(e) => setUploadConfig(e.target.value)}>
              {uploadConfig}
            </textarea>
          </div>
        </div>
        <input
          type="file"
          onChange={(e) => {
            if (!e.target.files) return console.log('error no file selected');
            const file = e.target.files[0];
            uploadFile(file, JSON.parse(uploadConfig));
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
        {urlFileList.map((urlFile) => {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
                wordWrap: 'break-word',
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
      <div
        style={{
          padding: '1em',
        }}
      >
        <h4>Get file </h4>
        <input
          type="text"
          onChange={(e) => {
            setCurrentCid(e.target.value);
          }}
        />
        <div>
          default config:
          <div
            style={{
              width: '300px',
              wordWrap: 'break-word',
            }}
          >
            {JSON.stringify({
              showBlobUrl: true,
              showInfoFile: true,
              showExtraProps: true,
            })}
          </div>
        </div>

        <button
          onClick={async () => {
            getFile(currentCid).then((props) => {
              setGetFileResponse(JSON.stringify(props));
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
            {getFileResponse}
          </div>
        </div>
      </div>
    </>
  );
};
