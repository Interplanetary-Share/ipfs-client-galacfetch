import { renderHook, act } from '@testing-library/react-hooks'
import { remoteIpfsFileManager } from '../src/remote-ipfs-file-manager'

it('increment counter', () => {
  const { result } = renderHook(() => remoteIpfsFileManager())
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1)
})
