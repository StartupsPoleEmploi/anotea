$(function () {

const help = function (appear, text) {
    $(appear).text(text).css({
        color: 'white',
        fontSize: '12px',
        textAlign: 'center',
        visibility: 'visible',
        paddingTop: '3px'
    })
}

const appreText = ['Pas du tout satisfait', 'Pas satisfait', 'Moyennement satisfait', 'Satisfait', 'Très satisfait'];

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    if(!iOS) {
        $('.rating-star').mouseleave(function () {
            var me = $(this)
            var root = me.parent().parent().parent()
            const checked = root.find('input:checked')[0]
            if(checked !== undefined) {
                const idx = parseInt($(checked).attr('value'))-1
                help(root.children('.appreciation')[0], appreText[idx])
            } else {
                $(root.children('.appreciation')[0]).text('').css({
                    visibility: 'hidden'
                })
            }
        })
        $('.rating-star').mouseenter(function () {
            var me = $(this)
            var root = me.parent().parent().parent()
            var idx = parseInt(me.prev().attr('value'))-1
            help(root.children('.appreciation')[0], appreText[idx])
        })
    }

$('[type*="radio"]').change(function () {
    var me = $(this);
    var root = me.parent().parent().parent();
    var idx = parseInt(me.attr('value'))-1
    help(root.children('.appreciation')[0], appreText[idx])

    var avis_accueil = $('input[name=avis_accueil]:checked').val();
    var avis_contenu_formation = $('input[name=avis_contenu_formation]:checked').val();
    var avis_equipe_formateurs = $('input[name=avis_equipe_formateurs]:checked').val();
    var avis_moyen_materiel = $('input[name=avis_moyen_materiel]:checked').val();
    var avis_accompagnement = $('input[name=avis_accompagnement]:checked').val();
    var avis_global = $('input[name=avis_global]:checked').val();

    if (avis_accueil && avis_contenu_formation && avis_equipe_formateurs && avis_moyen_materiel && avis_accompagnement && avis_global) {
        $('.suivantTxt').css({
            backgroundColor: '#4d79ff',
            fontSize: '20px',
        }).removeAttr("disabled");
    }
  })
})