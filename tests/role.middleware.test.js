const { allowRoles } = require('../middlewares/role.middleware');

describe('Role Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should allow access for role in group (e.g., "manager" in "MANAGEMENT")', () => {
    req = { user: { role: 'manager' } };

    allowRoles('MANAGEMENT')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should deny access for role not in group (e.g., "junior" not in "MANAGEMENT")', () => {
    req = { user: { role: 'junior' } };

    allowRoles('MANAGEMENT')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: insufficient permissions' });
  });

  test('should return 401 if user is not authenticated', () => {
    req = {}; // no user object

    allowRoles('MANAGEMENT')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: you do not have the required permissions to access this endpoint.' });
  });

  test('should return 500 if role group is undefined', () => {
    req = { user: { role: 'manager' } };

    allowRoles('NON_EXISTENT_GROUP')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal error: undefined role group' });
  });

  test('should allow access for "superuser" in "SUPERUSER"', () => {
    req = { user: { role: 'superuser' } };

    allowRoles('SUPERUSER')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should deny access for "manager" in "SUPERUSER"', () => {
    req = { user: { role: 'manager' } };

    allowRoles('SUPERUSER')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: insufficient permissions' });
  });
});
