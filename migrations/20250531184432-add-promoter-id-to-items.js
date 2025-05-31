module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('items', 'promoter_id', {
      type: Sequelize.UUID,
      references: {
        model: 'users', 
        key: 'id'
      },
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('items', 'promoter_id');
  }
};
