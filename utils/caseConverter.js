function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function keysToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toCamelCase(key)] = keysToCamel(value);
      return acc;
    }, {});
  }
  return obj;
}

module.exports = { keysToCamel };
