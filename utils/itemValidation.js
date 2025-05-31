/**
 * Validates that if quantity > 0 and size is provided as an array of objects,
 * then the total of size.qty matches the quantity value.
 *
 * @param {number} quantity - The total quantity from the main item data
 * @param {Array} sizeArray - The size array, e.g., [{ size: "XL", qty: 3 }]
 * @returns {Object} - { isValid: Boolean, message: String }
 */
function validateSizeQuantityMatch(quantity, sizeArray) {
  if (!Array.isArray(sizeArray) || sizeArray.length === 0) {
    return { isValid: true }; // Nothing to validate
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    return { isValid: true }; // Validation not needed if quantity is not > 0
  }

  const totalSizeQty = sizeArray.reduce((sum, item) => {
    const qty = parseInt(item.qty, 10);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);

  if (totalSizeQty !== quantity) {
    return {
      isValid: false,
      message: `Total quantity (${quantity}) must equal sum of size quantities (${totalSizeQty}).`,
    };
  }

  return { isValid: true };
}

module.exports = {
  validateSizeQuantityMatch,
};
