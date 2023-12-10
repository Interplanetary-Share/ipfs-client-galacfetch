import { renderHook, act } from '@testing-library/react-hooks'
import { general } from '../src/general'

it('increment counter', () => {
  const { result } = renderHook(() => general())
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1)
})
