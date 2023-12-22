var md;
window.onload = function() {
    md = window.markdownit()
}

$("#markdown").on("keyup", function() {
    var markdown = $(this).val();
    renderMarkdown(markdown);
});
function renderMarkdown(markdown) {
    var html = md.render(markdown);

    $("#result").html(html);

    hljs.highlightAll();
}

$('#post').click(function() {
    var html = $("#result").html();
    var markdown = $("#markdown").val();
    var title = $("#title").val();
    $.post("/tutorials/create", {markdown: markdown, html: html, title: title})
    .done(function(data) {
        window.location = "/tutorials"
    })
})