module.exports = ({ tri, ordre }) => {
    let field;
    switch (tri) {
        case "notes":
            field = "rates.global";
            break;
        case "formation":
            field = "training.title";
            break;
        default:
            field = "training.scheduledEndDate";
    }
    return { [field]: ordre === "asc" ? 1 : -1 };
};
