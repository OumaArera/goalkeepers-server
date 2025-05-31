const bcrypt = require('bcrypt');
const sequelize = require('../config/sequelize');
const User = require('../models/user.model');

describe('User Model with SQLite', () => {
  let validUserData;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Create schema
  });

  afterAll(async () => {
    await sequelize.close(); // Close connection
  });

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
      status: 'active',
      avatar: null
    };
  });

  afterEach(async () => {
    await User.destroy({ where: {} }); // Clear data
  });

  test('should validate and save a valid user', async () => {
    const user = await User.create(validUserData);
    expect(user.firstName).toBe('John');
    expect(user.email).toBe('john@example.com');
  });

  test('should throw validation error for invalid email', async () => {
    validUserData.email = 'invalid-email';
    await expect(User.create(validUserData)).rejects.toThrow();
  });

  test('should hash password before saving', async () => {
    const user = await User.create(validUserData);
    const isMatch = await bcrypt.compare('securePass123', user.password);
    expect(isMatch).toBe(true);
  });

  test('should block a user', async () => {
    const user = await User.create(validUserData);
    const blocked = await User.blockUserById(user.id);
    expect(blocked.status).toBe('blocked');
  });

  test('should unblock a user', async () => {
    const user = await User.create({ ...validUserData, status: 'blocked' });
    const unblocked = await User.unblockUserById(user.id);
    expect(unblocked.status).toBe('active');
  });

  test('should find user by email', async () => {
    await User.create(validUserData);
    const found = await User.findByEmailRegardlessOfStatus(validUserData.email);
    expect(found.email).toBe(validUserData.email);
  });

  test('should return null if user not found', async () => {
    const result = await User.findByEmailRegardlessOfStatus('nonexistent@example.com');
    expect(result).toBeNull();
  });

  test('should compare hashed and plain passwords correctly', async () => {
    const plain = 'securePass123';
    const hashed = await bcrypt.hash(plain, 10);
    const result = await User.validatePassword(plain, hashed);
    expect(result).toBe(true);
  });

  test('should apply filters in findAllWithFilters correctly', async () => {
    await User.create(validUserData);
    const result = await User.findAllWithFilters({ firstName: 'John' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].firstName).toContain('John');
  });
});
