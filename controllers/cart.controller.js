const { validationResult } = require('express-validator');
const sequelize = require('../config/sequelize');
const { Cart, Item } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const CartFilters = require('../filters/cartFilters');

class CartController {
  
  static async addItemToCart(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();

    try {
      const customerId = req.user.customerId;
      if (!customerId) return res.status(400).json({message: "Customer must be logged in"});

      const { itemId } = req.body;

      // Check if item exists
      const item = await Item.findByPk(itemId, { transaction });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if item already exists in cart for this customer
      const existingCartItem = await Cart.findOne({
        where: { customerId, itemId, status: 'pending' },
        transaction
      });

      if (existingCartItem) {
        await transaction.rollback();
        return res.status(409).json({ message: 'Item already exists in cart' });
      }

      // Create cart item
      const newCartItemData = {
        customerId,
        itemId,
        status: 'pending'
      };
      
      const cartItem = await Cart.create(newCartItemData, { transaction });

      // Commit transaction
      await transaction.commit();

      return res.status(201).json({
        message: 'Item added to cart successfully',
        data: cartItem
      });
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      console.error('Add to Cart Error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Item already exists in cart',
          field: 'itemId'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getCartItemById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const cartItem = await Cart.findByPk(id, {
        include: [{
          model: Item,
          as: 'item'
        }]
      });

      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      const camelCaseCartItem = keysToCamel(cartItem.toJSON());
      return res.status(200).json({ data: camelCaseCartItem });
    } catch (error) {
      console.error('Get Cart Item by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getAllCartItems(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = CartFilters.buildFilters(req.query);
      const sortOptions = CartFilters.buildSortOptions(req.query);

      const { rows, count } = await Cart.findAndCountAll({
        where: filters,
        include: [{
          model: Item,
          as: 'item',
          attributes: { exclude: ['createdAt', 'id', 'updatedAt'] },
        }],
        limit,
        offset,
        order: sortOptions,
      });

      const formatted = rows.map(cartItem => keysToCamel(cartItem.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Cart Items Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateCartItem(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Fields that should not be manually updated
    delete updateData.id;
    delete updateData.customerId;
    delete updateData.itemId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const transaction = await sequelize.transaction();

    try {
      // Fetch the current cart item
      const existingCartItem = await Cart.findByPk(id, { transaction });
      if (!existingCartItem) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Cart item not found' });
      }

      // Update cart item
      const [updated] = await Cart.update(updateData, { where: { id }, transaction });
      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Cart item not updated' });
      }

      const updatedCartItem = await Cart.findByPk(id, { transaction });
      await transaction.commit();

      const camelCaseCartItem = keysToCamel(updatedCartItem.toJSON());
      return res.status(200).json({
        message: 'Cart item updated successfully',
        data: camelCaseCartItem
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Update Cart Item Error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

}

module.exports = CartController;