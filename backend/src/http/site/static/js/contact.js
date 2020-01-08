$(document).ready(() => {

    $.get('/api/regions', data => {
        let html = '';
        data.forEach(region => {
            html += `<option value='${region.email}'>${region.nom}</option>`;
        });
        $('#region-select').html(html);
    });

    const closeModal = () => {
        $('.modal').hide();
    };

    const openModal = () => {
        $('.modal').show();
    };

    $('.open-modal-contact').click(e => {
        e.preventDefault();
        openModal();
    });

    $('.modal-contact .button.cancel').click(() => {
        closeModal();
    });

    $('.modal-contact .button.ok').click(() => {
        closeModal();
        //console.log($('#region-select').val());
        location.href = `mailto:${$('#region-select').val()}`;
    });
});
