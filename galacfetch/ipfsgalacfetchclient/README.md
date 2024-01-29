---
description: 'A React Hook that connect to galacfetch IPFS nodes to manage files on the IPFS network.'
labels:
  [
    'hook',
    'ipfs',
    'galacfetch',
    'react',
    'interplanetary',
    'file',
    'storage',
    'decentralized',
  ]
---

## Overview

`ipfsGalactFetchClient` serves as a comprehensive wrapper for managing multiple functionalities within the InterPlanetary File System (IPFS) ecosystem. This library integrates various `@intershare/hooks` modules, offering a unified interface for handling IPFS operations such as file management, WebRTC local sharing, and secure WebSocket communication. It acts as a central point of interaction, streamlining the process of initializing and utilizing these underlying services.

## Key Features

- **Unified Initialization**: Simplifies the setup process for multiple IPFS-related services.
- **File Retrieval and Management**: Provides methods to upload, download, update, and retrieve file metadata.
- **Real-Time Data Transfer**: Integrates WebRTC local sharing for peer-to-peer communication.
- **Secure WebSocket Management**: Ensures reliable and secure connections with remote servers.
- **Remote File Integrity Checking**: Offers tools to verify the integrity of remote files.

## Usage

### Initialization

```javascript
import { ipfsGalactFetchClient } from 'path-to-ipfsGalactFetchClient'

ipfsGalactFetchClient.init(
  'api-key', // Your API key
  'galactfetch', // Database name
  60000 // Discovery interval in milliseconds
)
```

### Fetching a File

```javascript
ipfsGalactFetchClient
  .getFile('uniqueCID')
  .then((response) => {
    console.log('File response:', response)
  })
  .catch((error) => {
    console.error('Error fetching file:', error)
  })
```

the getFile function is used to get a file from the IPFS network. expect 2 props to be passed to it. CID, and the config object.

```js
const { getFile } = ipfsGalactFetchClient()
export interface IFileRetrievalConfig {
  showBlobUrl?: boolean;
  showInfoFile?: boolean;
  showExtraProps?: boolean;
}
const config: IFileRetrievalConfig = {
  showBlobUrl: true,
  showInfoFile: true,
  showExtraProps: true,
}
```

### Fetching Multiple Files

```javascript
ipfsGalactFetchClient
  .getFiles(true, {
    /* config */
  })
  .then((response) => {
    console.log('Files response:', response)
  })
  .catch((error) => {
    console.error('Error fetching files:', error)
  })
```

the getFiles function is used to get a list of files from the IPFS network.

Expect 3 props to be passed to it. the `isPublic` scope, the configProps, and the filter/sort/page params, all optionals.

Basic example of use:

```js
const { getFiles } = ipfsGalactFetchClient();
const isPublic = false;
const config = {
  showBlobUrl: true,
  showInfoFile: true,
  showExtraProps: true,
};
copnst IPaginationAndSortingParams = {
  page:1,
  size:10,
  sort: { createdAt: -1 },
}

await getFiles(isPublic, config, IPaginationAndSortingParams);
```

There are 2 scopes

#### isPublic true vs isPublic false

the `isPublic` props of the files, by default is false, meaning you will get your files from your api token.

if you want to get the public files from the galacfetch network you need to set public to true,
meaning you will get the files that the `isPublic` is set to true.

```js
public?: boolean; // default false
```

#### configProps

same as getFile method above. optional, and all props are set to true by default.

```js
export interface IFileRetrievalConfig {
  showBlobUrl?: boolean;
  showInfoFile?: boolean;
  showExtraProps?: boolean;
}
```

#### IPaginationAndSortingParams (Optional)

page, size, filter, sort.

```js
// Pagination and Sorting Query Parameters
export interface IPaginationAndSortingParams {
  page?: number;
  size?: number;
  filter?: Record<string, unknown>;
  sort?: Record<string, unknown>;
}
```

##### page

page: number - The page number that you want to get. Default 1

##### size

size: number - The number of files per page. Default 10

##### filter

filter: object - The filter that you want to apply to the files, default undefined.

The filter obeys to query selectors https://docs.mongodb.com/manual/reference/operator/query/

You can check the official mongo DB https://www.mongodb.com/docs/compass/current/query/filter/

```js
// filter by name
{
  name: "fileName";
}

// search by name
{
  name: { $regex: "fileName", $options: "i" };
}


// filter by extra properties, example searching in  array of string "test2" and using regex to search in ownerID
{
  extraProperties: {
    likes:"test2", // search in array of string "test2"
    ownerID: {"$regex":"me","$options":"i" }  // search in ownerID using regex
    }
}

//  using OR operator
{
  $or: [
    { name: "fileName" },
    { name: { $regex: "fileName", $options: "i" } },
    {
      extraProperties: {
        likes: "test2",
        ownerID: { $regex: "me", $options: "i" },
      },
    },
  ],
}


// another OR example

{
  "$or": [
    {
      "type": {
        "$regex": "image/jpeg",
        "$options": "i"
      }
    },
    {
      "type": {
        "$regex": "image/gif",
        "$options": "i"
      }
    }
  ]
}

```

sort: object - The sort that you want to apply to the files. Default undefined
the sort obeys to cursor sort of mongo https://www.mongodb.com/docs/upcoming/reference/method/cursor.sort/#mongodb-method-cursor.sort

```js
// date descending sort from newest to oldest
{
  createdAt: -1
}
// date ascending sort from oldest to newest
{
  createdAt: 1
}
```

To sort by extraProperties you need to use the dot notation

```js
// sort by likes descending
{
  "extraProperties.likes": -1;
}
// sort by likes ascending
{
  "extraProperties.likes": 1;
}
```

If the extraProperties key is an array, will be created a new key with the Length of the array to sort by it. For example if you have an array of likes, will be created a new key likesLength with the length of the array to sort by it.

```js
// sort by likes descending by array  ["test2","another", "another2"]
{
  "extraProperties.likesLength": -1;
}
```

# Other Operations

For other operations (like update or upload) refer to each module documentation, compositions (small examples inside the code) For upload and update check Remote IPFS File Manager Hook

## How to use other imported tools

## Module Links

Direct links to the libraries used in `ipfsGalactFetchClient`:

- [IndexDB Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/indexdb) - For IndexedDB operations.
- [Local IPFS File Manager Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/local-ipfs-file-manager) - For managing local IPFS files.
- [Remote IPFS File Integrity Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/remote-ipfs-file-integrity) - For verifying the integrity of remote files.
- [Remote IPFS File Manager Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/remote-ipfs-file-manager) - For managing remote IPFS files.
- [Secure Connect Manager Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/secure-connect-manager) - For secure WebSocket connections.
- [WebRTC Local Share Hook Documentation](https://bit.cloud/intershare/galacfetch/hooks/web-rtc-local-share) - For WebRTC-based local file sharing.
- [General Utilities Documentation](https://bit.cloud/intershare/galacfetch/utils/general) - For general utility functions.

## Contributing

Contributions to `ipfsGalactFetchClient` are highly appreciated. Whether it's feature requests, bug reports, or code contributions, please feel free to engage with the project. Visit our [GitHub repository](https://github.com/Interplanetary-Share/ipfs-client-galacfetch) to submit pull requests or report issues.
