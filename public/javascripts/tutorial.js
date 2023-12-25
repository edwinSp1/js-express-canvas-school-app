
var md;

window.onload = function() {
    md = markdownit({
        // Enable HTML tags in source
        html:         true,
      
        // Use '/' to close single tags (<br />).
        // This is only for full CommonMark compatibility.
        xhtmlOut:     true,
      
        // Convert '\n' in paragraphs into <br>
        breaks:       false,
      
        // CSS language prefix for fenced blocks. Can be
        // useful for external highlighters.
        langPrefix:   'language-',
      
        // Autoconvert URL-like text to links
        linkify:      true,
      
        // Enable some language-neutral replacement + quotes beautification
        // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs
        typographer:  true,
      
        // Double + single quotes replacement pairs, when typographer enabled,
        // and smartquotes on. Could be either a String or an Array.
        //
        // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
        // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
        quotes: '“”‘’',
      
        // Highlighter function. Should return escaped HTML,
        // or '' if the source string is not changed and should be escaped externally.
        // If result starts with <pre... internal wrapper is skipped.
        highlight: function (/*str, lang*/) { return ''; }
      })
      .use(markdownitSub)
      .use(markdownitSup)
      .use(markdownitIns)
      .use(markdownitMark)
      .use(markdownitFootnote)
      .use(markdownitDeflist)
      .use(markdownitEmoji)
      .use(markdownitAbbr)
      .use(markdownitContainer, 'warning')
}

$("#markdown").on("keyup", function(e) {
    var markdown = $(this).val();
    renderMarkdown(markdown);
});
var heightRatio = $("#html-area").height() / $("#result").height()
$('#markdown').scroll(function(e){
    $('#result').scrollTop($(this).scrollTop() * heightRatio);
});
function renderMarkdown(markdown) {
    var html = md.render(markdown);
    html = DOMPurify.sanitize(html);
    $("#result").html(html);

    hljs.highlightAll();
}

$('#post').click(function() {
    var html = $("#result").html();
    var markdown = $("#markdown").val();
    var title = $("#title").val();
    //comma seperated list
    var categories = $("#categories").val()

    $.post("/tutorials/create", {markdown: markdown, html: html, title: title, categories: categories})
    .done(function(data) {
        window.location = "/tutorials"
    })
})