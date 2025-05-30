const Customer = require('../models/customer.model');
const db = require('../config/db');
const bcrypt = require('bcrypt');

jest.mock('../config/db');
jest.mock('bcrypt');

describe('Customer Model', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+254712345678',
    email: 'john@example.com',
    password: 'securePass123'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should validate a correct customer', async () => {
      const customer = new Customer(validData);
      await expect(customer.validate()).resolves.toBeUndefined();
    });

    it('should throw on invalid phone number', async () => {
      const customer = new Customer({ ...validData, phoneNumber: '123' });
      await expect(customer.validate()).rejects.toThrow('Validation Error');
    });

    it('should throw on missing fields', async () => {
      const customer = new Customer({ firstName: 'A' });
      await expect(customer.validate()).rejects.toThrow('Validation Error');
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const customer = new Customer(validData);
      await customer.hashPassword();
      expect(customer.password).toBe('hashedPassword');
    });
  });

  describe('save', () => {
    it('should save a valid customer', async () => {
      db.query
        .mockResolvedValueOnce({ rowCount: 0 }) // phone check
        .mockResolvedValueOnce({ rowCount: 0 }) // email check
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // insert

      bcrypt.hash.mockResolvedValue('hashedPass');

      const customer = new Customer(validData);
      const result = await customer.save();

      expect(result).toHaveProperty('id', 1);
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('should throw if phone number already exists', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 }); // phone exists
      const customer = new Customer(validData);
      await expect(customer.save()).rejects.toThrow('A buyer with this phone number already exists.');
    });

    it('should throw if email already exists', async () => {
      db.query
        .mockResolvedValueOnce({ rowCount: 0 }) // phone does not exist
        .mockResolvedValueOnce({ rowCount: 1 }); // email exists

      const customer = new Customer(validData);
      await expect(customer.save()).rejects.toThrow('A buyer with this email already exists.');
    });

    it('should handle unique constraint database error', async () => {
      db.query
        .mockResolvedValueOnce({ rowCount: 0 }) // phone
        .mockResolvedValueOnce({ rowCount: 0 }) // email
        .mockRejectedValueOnce({ code: '23505' }); // duplicate insert

      const customer = new Customer(validData);
      await expect(customer.save()).rejects.toThrow('Duplicate entry detected for email or phone number.');
    });
  });

  describe('toSafeObject & sanitize', () => {
    it('should exclude password', () => {
      const customer = new Customer(validData);
      customer.id = 1;
      const safeObj = customer.toSafeObject();
      expect(safeObj).not.toHaveProperty('password');
    });

    it('should sanitize null', () => {
      const result = Customer.sanitize(null);
      expect(result).toBeNull();
    });

    it('should sanitize a customer object', () => {
      const buyer = { ...validData, id: 1 };
      const result = Customer.sanitize(buyer);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findByPhoneNumber', () => {
    it('should return buyer by phone number', async () => {
      db.query.mockResolvedValue({ rows: [validData] });
      const result = await Customer.findByPhoneNumber(validData.phoneNumber);
      expect(result).toEqual(validData);
    });

    it('should return null if no buyer found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await Customer.findByPhoneNumber('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findActiveByPhoneNumber', () => {
    it('should return active buyer', async () => {
      db.query.mockResolvedValue({ rows: [validData] });
      const result = await Customer.findActiveByPhoneNumber(validData.phoneNumber);
      expect(result).toEqual(validData);
    });

    it('should return null if no active buyer found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const result = await Customer.findActiveByPhoneNumber(validData.phoneNumber);
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should compare passwords correctly', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const result = await Customer.validatePassword('plain', 'hashed');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      const result = await Customer.validatePassword('plain', 'wronghash');
      expect(result).toBe(false);
    });
  });

  describe('updateById', () => {
    it('should update allowed fields and return updated buyer', async () => {
      const updates = {
        firstName: 'Updated',
        phoneNumber: '+254700000000',
        password: 'newPassword123'
      };

      bcrypt.hash.mockResolvedValue('hashedNewPass');
      db.query.mockResolvedValue({ rows: [{ ...validData, ...updates }] });

      const result = await Customer.updateById(1, updates);
      expect(result).toHaveProperty('firstName', 'Updated');
    });

    it('should throw error if no fields provided', async () => {
      await expect(Customer.updateById(1, {})).rejects.toThrow('No valid fields provided for update.');
    });

    it('should throw error if buyer not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      await expect(Customer.updateById(1, { firstName: 'New' })).rejects.toThrow('Buyer not found');
    });

    it('should throw on invalid data', async () => {
      await expect(Customer.updateById(1, { phoneNumber: 'invalid' })).rejects.toThrow('Validation Error');
    });
  });
});
