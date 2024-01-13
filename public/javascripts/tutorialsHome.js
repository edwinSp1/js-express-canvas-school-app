let params = (new URL(document.location)).searchParams;
var pageNum = params.get('page') ?? 1
var searchVal = params.get('query') ?? ""
if (pageNum == 1) {
    $('back').hide()
}
$('#back').click(function() {
    window.location = `/tutorials?page=${pageNum-1}&query=${searchVal}`
})
$('#next').click(function() {
    window.location = `/tutorials?page=${new Number(pageNum)+1}&query=${searchVal}`
})
$("#clear-search").click(function() {
    window.location = '/tutorials'
})
var searchBar = document.getElementById('search-bar')
searchBar.value = searchVal
$("#search").click(function() {
    window.location = `/tutorials?query=${searchBar.value}`
})