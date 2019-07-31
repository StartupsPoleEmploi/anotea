import React from 'react';
import Page from './page';
import Graphes from './Graphes';

const SinglePage = ({ id, organisationId }) => (
    <Page singleMode={true} id={id}>
        <Graphes organisationId={organisationId} />
    </Page>
);

export default SinglePage;
