$(document).ready(function () {
    $(".question a").click(function (e) {
        e.preventDefault();

        const elem = $(e.target).parent().parent();
        elem.toggleClass('open closed');
        elem.next().toggle();
        $('.question.open').not(elem).removeClass('open').addClass('closed').next().hide();
    });
});