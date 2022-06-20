import { TruncatePipe } from "./pipes"

describe('pipes', () => {
  describe('TruncatePipe', () => {
    let sut: TruncatePipe

    beforeEach(() => {
      sut = new TruncatePipe()
    })

    it('should shorten long string', () => {
      const limit = 5
      const result = sut.transform('Hello, world!', limit)
      expect(result?.length).toEqual(limit + '...'.length)
    })
    it('should leave short string alone', () => {
      const str = 'Hello, world!'
      expect(sut.transform(str, str.length)?.length).toEqual(str.length)
    })
    it('should handle null', () => {
      expect(sut.transform(null)).toEqual(null)
    })
  })
})