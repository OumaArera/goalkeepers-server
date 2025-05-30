const db = require('../config/db');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const validateInternationalPhone = require('../utils/validatePhone');

class User {
  constructor({
    firstName,
    middleNames = null,
    lastName,
    dateOfBirth,
    nationalIdOrPassportNo,
    role,
    department,
    phonenumber,
    email,
    password,
    status = 'active',
  }) {
    this.firstName = firstName;
    this.middleNames = middleNames;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.nationalIdOrPassportNo = nationalIdOrPassportNo;
    this.role = role;
    this.department = department;
    this.phonenumber = phonenumber;
    this.email = email;
    this.password = password;
    this.status = status;
    this.createdAt = new Date();
    this.modifiedAt = new Date();
  }

  static get schema() {
    return Joi.object({
      firstName: Joi.string().required(),
      middleNames: Joi.string().allow(null, ''),
      lastName: Joi.string().required(),
      dateOfBirth: Joi.date().required(),
      nationalIdOrPassportNo: Joi.string().required(),
      role: Joi.string().valid('superuser', 'manager', 'player', 'junior', 'director').required(),
      department: Joi.string().valid('Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management').required(),
      phonenumber: Joi.string().required().custom((value, helpers) => {
        if (!validateInternationalPhone(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }).messages({
        'any.invalid': 'Invalid phone number format.',
        'string.empty': 'Phone number is required.',
      }),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      status: Joi.string().valid('active', 'blocked', 'suspended', 'deleted').default('active'),
    });
  }

  async validate() {
    const { error } = User.schema.validate(this, { allowUnknown: true });
    if (error) throw new Error(`Validation Error: ${error.message}`);
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async save() {
    await this.validate();
    await this.hashPassword();

    const emailExists = await db.query('SELECT 1 FROM users WHERE email = $1', [this.email]);
    if (emailExists.rowCount > 0) {
      throw new Error('A user with this email already exists.');
    }

    const phoneExists = await db.query('SELECT 1 FROM users WHERE phone_number = $1', [this.phonenumber]);
    if (phoneExists.rowCount > 0) {
      throw new Error('A user with this phone number already exists.');
    }

    const nationalIdorPassNoExists = await db.query('SELECT 1 FROM users WHERE national_id_or_passport_no = $1', [this.nationalIdOrPassportNo]);
    if (nationalIdorPassNoExists.rowCount > 0) {
      throw new Error('A user with this National Id or Passport No. already exists.');
    }

    const query = `
      INSERT INTO users (
        first_name,
        middle_names,
        last_name,
        date_of_birth,
        national_id_or_passport_no,
        role,
        department,
        phone_number,
        email,
        password,
        created_at,
        modified_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
    `;

    const values = [
      this.firstName,
      this.middleNames,
      this.lastName,
      this.dateOfBirth,
      this.nationalIdOrPassportNo,
      this.role,
      this.department,
      this.phonenumber,
      this.email,
      this.password,
      this.createdAt,
      this.modifiedAt,
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
    const { password, ...safeUser } = this;
    return safeUser;
  }


  static sanitize(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findActiveByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [email, 'active']
    );
    return result.rows[0] || null;
  }

  static async findByEmailRegardlessOfStatus(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateById(userId, data) {
    const schema = User.schema.fork(Object.keys(User.schema.describe().keys), (field) =>
      field.optional()
    );

    const { error } = schema.validate(data);
    if (error) throw new Error(`Validation Error: ${error.message}`);

    const allowedFields = {
      firstName: 'first_name',
      middleNames: 'middle_names',
      lastName: 'last_name',
      dateOfBirth: 'date_of_birth',
      nationalIdOrPassportNo: 'national_id_or_passport_no',
      role: 'role',
      department: 'department',
      phonenumber: 'phone_number',
      email: 'email',
      password: 'password',
      status: 'status'
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

    // Always update modified_at
    updates.push(`modified_at = $${index}`);
    values.push(new Date());

    const query = `
      UPDATE users SET ${updates.join(', ')} WHERE id = $${index + 1} RETURNING *
    `;

    values.push(userId);

    try {
      const result = await db.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Database Update Error: ${err.message}`);
    }
  }

  static async unblockUserById(userId) {
    return await User.updateById(userId, { status: 'active' });
  }

  static async blockUserById(userId) {
    return await User.updateById(userId, { status: 'blocked' });
  }

  static async findById(userId) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    const allowedFilters = {
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      department: 'department',
      status: 'status',
      email: 'email',
    };

    const conditions = [];
    const values = [];
    let index = 1;

    for (const [key, column] of Object.entries(allowedFilters)) {
      if (filters[key]) {
        conditions.push(`${column} ILIKE $${index}`);
        values.push(`%${filters[key]}%`);
        index++;
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`;

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (err) {
      throw new Error(`Database Query Error: ${err.message}`);
    }
  }
}

module.exports = User;
