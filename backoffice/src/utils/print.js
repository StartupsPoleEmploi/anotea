import html2canvas from 'html2canvas';
import JSPDF from 'jspdf';

export const printPDF = async element => {
    let pdf = new JSPDF('landscape', 'px', 'a4');

    let canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, 'stats', 'FAST');

    return pdf.save(`export.pdf`);
};
