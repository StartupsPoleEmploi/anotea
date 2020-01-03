import React from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import FinanceurPage from "./FinanceurPage";
import MonComptePage from "../common/MonComptePage";

export default class FinanceurRoutes extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    render() {
        let { router } = this.props;
        return (
            <>
                <Route
                    path={"/admin/financeur/avis"}
                    render={() => <FinanceurPage router={router} />}
                />
                <Route
                    path={"/admin/financeur/mon-compte"}
                    component={MonComptePage}
                />
            </>
        );
    }
}
