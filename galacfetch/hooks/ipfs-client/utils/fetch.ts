import { IFileUploadResponse } from '../types'
import { useRemoteIpfsClient } from '../src/useRemoteIpfsClient'

export const getServers = async (serverGetHost: string): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()
  try {
    const response = await fetch(serverGetHost, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${api}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const checkIntegrityFile = async (
  serverCheck: string,
  fileInfo: { serverAlias: string },
  cid: string
): Promise<boolean> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = `${serverCheck}/${fileInfo.serverAlias}/${cid}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${api}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as boolean
  } catch (err) {
    throw new Error(err)
  }
}

export const getFileInfo = async (
  fileApi: string,
  cid: string
): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = `${fileApi}/${cid}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${api}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

export const getAllFilesInfo = async (
  getAllFiles: string,

  queryParams: any,
  isPublic: boolean
): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = new URL(getAllFiles)
    const params = { ...queryParams, isPublic }
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    )

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${api}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

export const uploadFile = async (
  fileUpload: string,
  formData: FormData,

  isPublic: boolean
): Promise<IFileUploadResponse> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = new URL(fileUpload)
    url.searchParams.append('isPublic', isPublic.toString())

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data
  } catch (err) {
    console.error(err)
  }
}

export const restoreFileIntegrity = async (
  restoreIntegrity: string,
  serverAlias: string,
  formData: FormData
): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = `${restoreIntegrity}/${serverAlias.trim()}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

export const getExtraProps = async (
  getExtraPropsFiles: string,
  cid: string
): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = `${getExtraPropsFiles}/${cid}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${api}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

export const updateFileProps = async (
  fileApi: string,
  cid: string,
  fileProps: any
): Promise<any> => {
  const { api } = useRemoteIpfsClient.getState()

  try {
    const url = `${fileApi}/${cid}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api}`,
      },
      body: JSON.stringify(fileProps),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}
