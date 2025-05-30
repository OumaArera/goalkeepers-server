const db = require('../config/db');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

jest.mock('../config/db');

describe('User Model Tests', () => {
  let validUserData;

  beforeEach(() => {
    validUserData = {
      firstName: 'John',
      middleNames: 'Doe',
      lastName: 'Smith',
      dateOfBirth: '1990-01-01',
      nationalIdOrPassportNo: 'A12345678',
      role: 'player',
      department: 'Players',
      phonenumber: '+254712345678',
      email: 'john@example.com',
      password: 'securePass123',
      status: 'active'
    };

    db.query.mockClear();
  });

  test('should validate and save a valid user', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 0 }) // email check
      .mockResolvedValueOnce({ rowCount: 0 }) // phone check
      .mockResolvedValueOnce({ rowCount: 0 }) // ID/passport check
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // insert

    const user = new User(validUserData);
    const savedUser = await user.save();

    expect(savedUser.id).toBe(1);
    expect(db.query).toHaveBeenCalledTimes(4);
  });

  test('should throw validation error for invalid email', async () => {
    validUserData.email = 'invalid-email';
    const user = new User(validUserData);

    await expect(user.save()).rejects.toThrow('Validation Error');
  });

  test('should throw error for duplicate email', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 1 }); // email check

    const user = new User(validUserData);
    await expect(user.save()).rejects.toThrow('A user with this email already exists.');
  });

  test('should hash password before saving', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 0 }) // email
      .mockResolvedValueOnce({ rowCount: 0 }) // phone
      .mockResolvedValueOnce({ rowCount: 0 }) // ID
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // insert

    const user = new User(validUserData);
    await user.save();

    expect(bcrypt.compareSync('securePass123', user.password)).toBe(true);
  });

  test('should block a user', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'blocked' }] });

    const result = await User.blockUserById(1);
    expect(result.status).toBe('blocked');
  });

  test('should unblock a user', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'active' }] });

    const result = await User.unblockUserById(1);
    expect(result.status).toBe('active');
  });

  test('should find user by email', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ email: 'john@example.com' }] });

    const user = await User.findByEmail('john@example.com');
    expect(user.email).toBe('john@example.com');
  });

  test('should return null if user not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const user = await User.findByEmail('notfound@example.com');
    expect(user).toBeNull();
  });

  test('should compare hashed and plain passwords correctly', async () => {
    const plain = 'password123';
    const hashed = await bcrypt.hash(plain, 10);

    const match = await User.validatePassword(plain, hashed);
    expect(match).toBe(true);
  });

  test('should apply filters in findAll correctly', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ first_name: 'John' }] });

    const users = await User.findAll({ firstName: 'John' });
    expect(users.length).toBe(1);
    expect(users[0].first_name).toBe('John');
  });
});
