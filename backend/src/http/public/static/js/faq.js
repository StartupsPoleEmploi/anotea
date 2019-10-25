$(document).ready(function () {
    $(".question a").click(function (e) {
        e.preventDefault();
        $('.question').removeClass('open').addClass('closed').next().hide();
        $(e.target).parent().toggleClass('open closed');
        $(e.target).parent().next().toggle();
    });
});