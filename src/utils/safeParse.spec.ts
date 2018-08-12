import { expect } from 'chai';
import { safeParse } from './safeParse';
const badJsons = [{}, 'string-123', '{v:1}', { v: 1 }, 'undefined', undefined, NaN, 'NaN'];
describe('safeParse', async () => {
  it('should parse valid json', () => {
    expect(safeParse('{"v":1}')).to.eql({ v: 1 });
  });
  badJsons.forEach((badJson: any) =>
    it(`should return false after parsing invalid json ${JSON.stringify(badJson)}`, () => {
      expect(safeParse(badJson)).to.eql(false);
    }),
  );
});
