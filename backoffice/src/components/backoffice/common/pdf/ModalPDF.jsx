import React from 'react';
import PropTypes from 'prop-types';
import Page from './Page';
import PrintButton from './PrintButton';

const ModalPDF = ({ children }) => (
    <div className="modal fade" id="exampleModalLong" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
        <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLongTitle">Modal title</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <Page singleMode={true} id="singlePage">
                        {children}
                    </Page>
                </div>
                <div className="modal-footer">
                    <PrintButton id={'singlePage'} label={'Imprimer cette page'} />
                </div>
            </div>
        </div>
    </div>
);

ModalPDF.propTypes = {
    children: PropTypes.array.isRequired,
};

export default ModalPDF;
