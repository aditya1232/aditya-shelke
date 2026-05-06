const { successResponse, errorResponse } = require('../src/utils/response');

test('successResponse sends JSON with status 200', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  successResponse(res, 'OK', { test: true });

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    message: 'OK',
    data: { test: true },
  });
});