import { isValidEmail } from './../';

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    [
      'test@gmail.com', 'test@hotmail.co.uk', 'lorem.ipsum@anywhere.com.au'
    ].forEach(eml => expect(isValidEmail(eml)).toStrictEqual(true));
  });

  it('should return false for invalid emails', () => {
    [
      '', 'nothing.good', 'missing@domain', 'not@real@email.com', 'Danny Devito',
      'it.dont.matter@test', 'テスト@test.co.jp'
    ].forEach(eml => expect(isValidEmail(eml)).toStrictEqual(false));
  });
});
