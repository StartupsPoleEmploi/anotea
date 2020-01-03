import queryString from "query-string";
import _ from "lodash";

const stringifyQuery = data => {
    let parameters = _(data)
    .omitBy(_.isNil)
    .omitBy(value => value === "")
    .value();

    return queryString.stringify(parameters);
};

export const createRouter = ({ history, location }) => {
    return {
        getQuery: () => {
            return queryString.parse(location.search);
        },
        isActive: url => {
            //Ignore parameters when comparing the current location with the link url
            let baseUrl = url.indexOf("?") === -1 ? url : url.split("?")[0];
            return location.pathname.indexOf(baseUrl) !== -1;
        },
        refreshCurrentPage: (query = {}) => {
            return history.push(`${location.pathname}?${(stringifyQuery(query))}`);
        },
        goToPage: (url, query = {}) => {
            return history.push(`${url}?${(stringifyQuery(query))}`);
        },
        goBack: () => {
            return history.goBack();
        },
    };
};
