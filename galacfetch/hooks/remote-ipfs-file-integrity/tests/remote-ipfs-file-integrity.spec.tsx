import { renderHook, act } from '@testing-library/react-hooks'
import { remoteIpfsFileIntegrity } from '../src/remote-ipfs-file-integrity'

it('increment counter', () => {
  const { result } = renderHook(() => remoteIpfsFileIntegrity())
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1)
})
