const db = require('../config/db');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const validateInternationalPhone = require('../utils/validatePhone');

class Customer {
  constructor({ firstName, lastName, phoneNumber, email = null, password }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.password = password;
    this.status = 'active';
    this.createdAt = new Date();
    this.modifiedAt = new Date();
  }

  static get schema() {
    return Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phoneNumber: Joi.string().required().custom((value, helpers) => {
        if (!validateInternationalPhone(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).messages({
        'any.invalid': 'Invalid phone number format.',
        'string.empty': 'Phone number is required.',
      }),
      email: Joi.string().email().allow(null, ''),
      password: Joi.string().min(8).required(),
    });
  }

  async validate() {
    const { error } = Customer.schema.validate(this, { allowUnknown: true });
    if (error) throw new Error(`Validation Error: ${error.message}`);
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async save() {
    await this.validate();
    await this.hashPassword();

    // Check for existing phone number
    const phoneExists = await db.query('SELECT 1 FROM customers WHERE phone_number = $1', [this.phoneNumber]);
    if (phoneExists.rowCount > 0) {
      throw new Error('A buyer with this phone number already exists.');
    }

    // Optional email check
    if (this.email) {
      const emailExists = await db.query('SELECT 1 FROM customers WHERE email = $1', [this.email]);
      if (emailExists.rowCount > 0) {
        throw new Error('A buyer with this email already exists.');
      }
    }

    const query = `
      INSERT INTO customers (
        first_name,
        last_name,
        phone_number,
        email,
        password,
        status,
        created_at,
        modified_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id
    `;

    const values = [
      this.firstName,
      this.lastName,
      this.phoneNumber,
      this.email,
      this.password,
      this.status,
      this.createdAt,
      this.modifiedAt
    ];

    try {
      const result = await db.query(query, values);
      this.id = result.rows[0].id;
      return this;
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('Duplicate entry detected for email or phone number.');
      }
      throw new Error(`Database Error: ${err.message}`);
    }
  }

  toSafeObject() {
    const { password, ...safeBuyer } = this;
    return safeBuyer;
  }

  static sanitize(buyer) {
    if (!buyer) return null;
    const { password, ...safeBuyer } = buyer;
    return safeBuyer;
  }

  static async findByPhoneNumber(phoneNumber) {
    const result = await db.query('SELECT * FROM customers WHERE phone_number = $1', [phoneNumber]);
    return result.rows[0] || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findActiveByPhoneNumber(phoneNumber) {
    const result = await db.query(
      'SELECT * FROM customers WHERE phone_number = $1 AND status = $2',
      [phoneNumber, 'active']
    );
    return result.rows[0] || null;
  }

  static async updateById(buyerId, data) {
    const schema = Customer.schema.fork(Object.keys(Customer.schema.describe().keys), (field) =>
      field.optional()
    );

    const { error } = schema.validate(data);
    if (error) throw new Error(`Validation Error: ${error.message}`);

    const allowedFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      phoneNumber: 'phone_number',
      email: 'email',
      password: 'password',
    };

    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, column] of Object.entries(allowedFields)) {
      if (data[key] !== undefined) {
        if (key === 'password') {
          const hashed = await bcrypt.hash(data[key], 10);
          updates.push(`${column} = $${index}`);
          values.push(hashed);
        } else {
          updates.push(`${column} = $${index}`);
          values.push(data[key]);
        }
        index++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields provided for update.');
    }

    updates.push(`modified_at = $${index}`);
    values.push(new Date());

    const query = `
      UPDATE customers SET ${updates.join(', ')} WHERE id = $${index + 1} RETURNING *
    `;

    values.push(buyerId);

    try {
      const result = await db.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Buyer not found');
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Database Update Error: ${err.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (err) {
      throw new Error(`Database Retrieval Error (findById): ${err.message}`);
    }
  }

  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
      return result.rows;
    } catch (err) {
      throw new Error(`Database Retrieval Error (findAll): ${err.message}`);
    }
  }

}

module.exports = Customer;
