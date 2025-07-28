import { SessionRecord } from 'amos-testing';

describe('SessionRecord.isAnonymous', () => {
  it('should return true when user is anonymous', () => {
    const record = new SessionRecord();
    expect(record.isAnonymous()).toBe(true);
  });

  it('should return false when user is logged in', () => {
    const record = new SessionRecord({ userId: 1 });
    expect(record.isAnonymous()).toBe(false);
  });
});
