$(document).ready(function() {

    $.get('/api/backoffice/regions', function(data) {
        let html = '';
        for (var i = 0; i < data.length; i++) {
            var region = data[i];
            html += '<option value="' + region.email + '">' + region.nom + '</option>';
        }
        html += '<option value="anotea@anotea.pole-emploi.fr">Autre région</option>';

        $('#region-select').html(html);
    });

    const closeModal = function() {
        $('.modal').hide();
    };

    const openModal = function() {
        $('.modal').show();
    };

    $('.open-modal-contact').click(function(e) {
        e.preventDefault();
        openModal();
    });

    $('.modal-contact .button.cancel').click(function() {
        closeModal();
    });

    $('.modal-contact .button.ok').click(function() {
        closeModal();
        location.href = 'mailto:' + $('#region-select').val();
    });
});
