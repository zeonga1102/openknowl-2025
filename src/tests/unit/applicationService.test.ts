import { getMyApplicationList } from '../../services/applicationService';

describe('getApplicationList unit test - 내 신청 내역 조회 관련 서비스 유닛 테스트', () => {
  let em: any;
  let appRepo: any;

  beforeEach(() => {
    appRepo = { find: jest.fn() };
    em = { getRepository: jest.fn(() => appRepo) };
  })

  it('application 목록 조회 성공', async () => {
    const input = {
      limit: 5,
      last: 1
    };
    const requestUser = {
      id: 1,
      username: 'test',
      isAdmin: false
    };

    await getMyApplicationList(em, input, requestUser);

    expect(appRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        user: requestUser.id,
        mclass: { id: { $lt: input.last }, isDelete: false }
      }),
      expect.anything()
    );
  });

  it('last가 없는 경우 application 목록 조회 성공', async () => {
    const input = {
      limit: 5,
      last: undefined
    };
    const requestUser = {
      id: 1,
      username: 'test',
      isAdmin: false
    };

    await getMyApplicationList(em, input, requestUser);

    expect(appRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        user: requestUser.id,
        mclass: { isDelete: false }
      }),
      expect.anything()
    );
  });
});