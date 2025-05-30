function getPagination(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  return {
    limit,
    offset,
    page,
  };
}

function getPagingData(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    totalItems: total,
    totalPages,
    currentPage: page,
    pageSize: limit,
    data,
  };
}

module.exports = {
  getPagination,
  getPagingData,
};
