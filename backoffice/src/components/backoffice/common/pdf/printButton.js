import React from 'react';
import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';

const pxToMm = px => {
    return Math.floor(px / document.getElementById('myMm').offsetHeight);
};
const mmToPx = mm => {
    return document.getElementById('myMm').offsetHeight * mm;
};
const range = (start, end) => {
    return Array(end - start).join(0).split(0).map(function(val, id) {
        return id + start
        ;
    });
};
const pdf = new JSPDF();

const PrintButton = ({ id, label }) => (<div className="tc mb4 mt2">
    {/*
    Getting pixel height in milimeters:
    https://stackoverflow.com/questions/7650413/pixel-to-mm-equation/27111621#27111621
  */}
    <div id="myMm" style={{ height: '1mm' }} />

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
</div>);

export default PrintButton;
