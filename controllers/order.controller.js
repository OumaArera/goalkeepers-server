const { validationResult } = require('express-validator');
const sequelize = require('../config/sequelize');
const { Order, Item } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { keysToCamel } = require('../utils/caseConverter');
const OrderFilters = require('../filters/orderFilters');
const OrderNumberGenerator = require('../utils/orderNumber');


class OrderController {
  
  static async createOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction(); 

    try {

      // Generate order number
      const orderNumber = await OrderNumberGenerator.generateOrderNumber();

      const customerId = req.user.customerId;
      if (!customerId) return res.status(400).json({message: "Customer must be logged in"});

      // Create order
      const newOrderData = {
        ...req.body,
        orderNumber,
        customerId
      };
      const order = await Order.create(newOrderData, { transaction });

      // Commit transaction
      await transaction.commit();

      return res.status(201).json({
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      console.error('Create Order Error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Order number already exists',
          field: 'orderNumber'
        });
      }
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async getOrderById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const order = await Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const camelCaseOrder = keysToCamel(order.toJSON());
      return res.status(200).json({ data: camelCaseOrder });
    } catch (error) {
      console.error('Get Order by ID Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }


  static async getAllOrders(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { limit, offset, page } = getPagination(req.query);
      const filters = OrderFilters.buildFilters(req.query);
      const sortOptions = OrderFilters.buildSortOptions(req.query);

      const { rows, count } = await Order.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: sortOptions,
      });

      const formatted = rows.map(order => keysToCamel(order.toJSON()));
      const response = getPagingData(formatted, count, page, limit);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Get All Orders Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  static async updateOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { itemsPurchased, ...otherUpdates } = req.body;

    // Start transaction
    const transaction = await sequelize.transaction();
    try {
      const existingOrder = await Order.findByPk(id, { transaction });

      if (!existingOrder) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Order not found' });
      }

      // Merge or mutate itemsPurchased
      if (itemsPurchased) {
        const currentItems = existingOrder.itemsPurchased;

        let updatedItems;

        if (!Array.isArray(currentItems)) {
          // Replace with new items if current is not an array
          updatedItems = itemsPurchased;
        } else {
          // Append new items to the existing array
          updatedItems = [...currentItems, ...itemsPurchased];
        }

        otherUpdates.itemsPurchased = updatedItems;
      }

      if (otherUpdates.status === 'delivered' && !otherUpdates.deliveredAt) {
        otherUpdates.deliveredAt = new Date();
      }

      const [updated] = await Order.update(otherUpdates, {
        where: { id },
        transaction,
      });

      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Order not updated' });
      }

      const updatedOrder = await Order.findByPk(id, { transaction });
      await transaction.commit();

      const camelCaseOrder = keysToCamel(updatedOrder.toJSON());
      return res.status(200).json({
        message: 'Order updated successfully',
        data: camelCaseOrder,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Update Order Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }


  static async deleteOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const deleted = await Order.destroy({ where: { id } });

      if (!deleted) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Delete Order Error:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

module.exports = OrderController;