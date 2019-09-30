import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

const WithRouter = props => {
    return props.render(props);
};

WithRouter.propTypes = {
    render: PropTypes.func.isRequired,
};

export default withRouter(props => <WithRouter {...props} />);
