import React from "react";
import PropTypes from "prop-types";
import Link from "../common/header/Link";
import { getAvisStats } from "../../services/statsService";
import Pastille from "../common/Pastille";

export default class ModerateurHeaderItems extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stats: {},
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    fetchStats = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let stats = await getAvisStats();
                this.setState({ stats, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { router } = this.props;
        let { stats } = this.state;

        let isEmailsPreview = router.isActive("/admin/moderateur/emails");

        return (
            <ul className="nav">
                <li className="nav-item">
                    <Link
                        className="nav-link"
                        url="/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none"
                    >
                        <div className="Pastille--holder">
                            Avis
                            {stats.nbAModerer > 0 && <Pastille />}
                        </div>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        className="nav-link"
                        url="/admin/moderateur/moderation/avis/reponses?reponseStatuses=none&sortBy=reponse.lastStatusUpdate"
                    >
                        <div className="Pastille--holder">
                            Réponses
                            {(stats.nbReponseAModerer > 0 || stats.nbCommentairesReported > 0) && <Pastille />}
                        </div>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" url="/admin/moderateur/gestion/organismes">
                        Organismes
                    </Link>
                </li>
                <li className="nav-item dropdown">
                    <a
                        href="/#"
                        className={`nav-link dropdown-toggle  ${isEmailsPreview ? "active" : ""}`}
                        data-toggle="dropdown"
                        role="button"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        Courriels
                    </a>
                    <div className="dropdown-menu">
                        <Link className="nav-link" url="/admin/moderateur/emails/stagiaires">
                            Stagiaires
                        </Link>
                        <Link className="nav-link" url="/admin/moderateur/emails/organismes">
                            Organismes
                        </Link>
                    </div>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" url="/admin/moderateur/mon-compte">
                        Mon compte
                    </Link>
                </li>
            </ul>
        );

    }
}
