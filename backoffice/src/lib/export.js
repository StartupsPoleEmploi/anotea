const S = require('string');
const POLE_EMPLOI = '4';

export const exportToExcel = (comments, codeFinancer) => {
    let lines = '\ufeffnote accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;etape;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n';

    if (codeFinancer === POLE_EMPLOI) {
        let array = lines.split(';');
        array.splice(9, 0, 'qualification');
        lines = array.join(';');
    }

    for (const idx in comments) {

        if (comments[idx].comment !== undefined && comments[idx].comment !== null) {
            comments[idx].pseudo = (comments[idx].pseudo !== undefined) ? comments[idx].pseudo.replace(/\r?\n|\r/g, ' ') : '';
            comments[idx].comment.title = (comments[idx].comment.title !== undefined) ? comments[idx].comment.title.replace(/\r?\n|\r/g, ' ').replace(/[;]+/g, ',') : '';
            comments[idx].comment.text = (comments[idx].comment.text !== undefined) ? comments[idx].comment.text.replace(/\r?\n|\r/g, ' ').replace(/[;]+/g, ',') : '';
        }

        let pseudo = '';
        let commentTitle = '';
        let commentText = '';
        if (comments[idx].comment !== undefined && comments[idx].comment !== null) {
            commentTitle = '"' + S(comments[idx].comment.title).decodeHTMLEntities().s + '"';
            commentText = '"' + S(comments[idx].comment.text).decodeHTMLEntities().s + '"';
            pseudo = '"' + S(comments[idx].pseudo).decodeHTMLEntities().s + '"';
        }

        let qualification = '';
        if (codeFinancer === POLE_EMPLOI) {
            qualification = ';' + comments[idx].qualification;
        }

        lines += (comments[idx].rates !== undefined ? comments[idx].rates.accueil : '') + ';' +
            (comments[idx].rates !== undefined ? comments[idx].rates.contenu_formation : '') + ';' +
            (comments[idx].rates !== undefined ? comments[idx].rates.equipe_formateurs : '') + ';' +
            (comments[idx].rates !== undefined ? comments[idx].rates.moyen_materiel : '') + ';' +
            (comments[idx].rates !== undefined ? comments[idx].rates.accompagnement : '') + ';' +
            (comments[idx].rates !== undefined ? comments[idx].rates.global : '') + ';' +
            pseudo + ';' +
            commentTitle + ';' +
            commentText +
            (codeFinancer === POLE_EMPLOI ? qualification : ``) + ';' +
            comments[idx].campaign + ';' +
            comments[idx].step + ';' +
            comments[idx].date + ';' +
            comments[idx].accord + ';' +
            comments[idx].training.idFormation + ';' +
            comments[idx].training.title + ';' +
            (comments[idx].training.startDate).toString('DD/MM/YYYY') + ';' +
            (comments[idx].training.scheduledEndDate).toString('DD/MM/YYYY') + ';' +
            '\'' + comments[idx].training.organisation.id + '\';' +
            '\'' + comments[idx].training.organisation.siret + '\';' +
            comments[idx].training.organisation.label + ';' +
            comments[idx].training.organisation.name + ';' +
            comments[idx].training.place.postalCode + ';' +
            comments[idx].training.place.city + ';' +
            '\'' + comments[idx].training.certifInfo.id + '\';' +
            comments[idx].training.certifInfo.label + ';' +
            comments[idx].training.idSession + ';' +
            comments[idx].training.formacode + ';' +
            comments[idx].training.aesRecu + ';' +
            comments[idx].training.referencement + ';' +
            comments[idx].training.idSessionAudeFormation + ';' +
            (comments[idx].training.infoCarif !== undefined ? comments[idx].training.infoCarif.numeroAction : '') + ';' +
            (comments[idx].training.infoCarif !== undefined ? comments[idx].training.infoCarif.numeroSession : '') + ';' +
            comments[idx].training.codeFinanceur  + '\n';
    }
    const hiddenElement = document.createElement('a');
    let csvData = new Blob([lines], { type: 'text/csv;charset=utf-8' });

    hiddenElement.href = URL.createObjectURL(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'comments.csv';
    hiddenElement.click();
};
