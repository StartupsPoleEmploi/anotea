import React from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';

const pdf = new JSPDF();

const PrintButton = ({ id, label }) => (

    <button
        type="button" className="btn btn-primary"
        onClick={() => {
            const input = document.getElementById(id);

            html2canvas(input)
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
          
                pdf.addImage(imgData, 'PNG', 0, 0);
                pdf.save(`${id}.pdf`);
            });
      
        }}
    >
        {label}
    </button>

);

PrintButton.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default PrintButton;
