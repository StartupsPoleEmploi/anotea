import React from 'react';
import Page from './page';
import PrintButton from './printButton.js';

const ModalPDF = ({ component }) => (
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
                        {component}
                    </Page>
                </div>
                <div className="modal-footer">
                    <PrintButton id={'singlePage'} label={'Print single page'} />
                </div>
            </div>
        </div>
    </div>
);

export default ModalPDF;
