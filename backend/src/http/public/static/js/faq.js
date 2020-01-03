$(document).ready(function() {
    $(".question a").click(function(e) {
        e.preventDefault();

        const target = $(e.target);

        let elem = target.parent();
        if (target.prop("tagName") !== "A") {
            elem = elem.parent();
        }

        elem.toggleClass("open closed");
        elem.next().toggle();
        $(".question.open").not(elem).removeClass("open").addClass("closed").next().hide();
    });
});