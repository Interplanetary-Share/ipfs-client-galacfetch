import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useIpfsStore } from './useIpfsStore';
import { fileToBlobUrl } from './utils/file';
export const BasicipfsClient = () => {
  const {
    ipfs,
    init,
    localCheckIsFile,
    localGetFile,
    localAddFile,
    localGetAllFiles,
  } = useIpfsStore();

  const cidFileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Helmet>
        <script src="https://cdn.jsdelivr.net/npm/ipfs-core/dist/index.min.js"></script>
      </Helmet>
      <button onClick={() => init()}>init</button>
      <button onClick={() => localCheckIsFile('')}>localCheckIsFile</button>
      <button onClick={() => localGetFile('')}>localGetFile</button>
      <button onClick={() => localGetAllFiles()}>localGetAllFiles</button>
      ipfs: {!!ipfs}
      <div>
        <h1>Upload File</h1>
        <input
          type="file"
          onChange={(e) => {
            if (!e.target.files) return console.log('error no file selected');
            const file = e.target.files[0];
            console.log(`fastlog => file:`, file);

            const blob = fileToBlobUrl(file);
            console.log(`fastlog => blob:`, blob);
            localAddFile(blob).then((res) => {
              console.log(`fastlog => res:`, res);
              e.target.value = '';
            });
          }}
        />
      </div>
      <div>
        <h1>Get CID File</h1>
        <input type="text" ref={cidFileRef} />
        <button
          onClick={() => {
            if (!cidFileRef?.current)
              return console.log('error no cid selected');
            const cid = cidFileRef.current?.value;
            localGetFile(cid).then((href) => {
              console.log(`fastlog => href:`, href);
            });
          }}
        >
          localGetFile(cid)
        </button>
      </div>
    </>
  );
};
