module.exports = (pagination, total) => {
    return {
        ...pagination,
        total_items: total,
        total_pages: Math.ceil(total / pagination.items_par_page),
    };
};
