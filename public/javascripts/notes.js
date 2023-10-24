const docs = document.querySelectorAll('.doc')
const searchButton = document.getElementById('search')
var searchBar = document.getElementById('search-query')
const filterContainer = document.getElementById('filter-container')
const filters = filterContainer.childNodes

searchButton.addEventListener('click', check)

searchBar.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
});

function check() {
  console.log(filters)
  var filterStr = Array.from(filters).map((filter) => {
    return filter.children[1].checked ? filter.children[0].textContent : ''
  }).join(",")
  window.location = `/notes/1?query=${searchBar.value}&filters=${filterStr}`
}
const cancelButton = document.getElementById('cancel')
cancelButton.addEventListener('click', function() {
  window.location = '/notes/1'
})

document.getElementById('apply-filters').addEventListener('click', check)

var pageNum = document.getElementById('page').innerHTML
console.log(pageNum)
$('#next').on('click', function(e) {
  window.location =`/notes/${Number(pageNum)+1}?query=${searchBar.value}`
})
var prevButton = $('#prev')
//the prevButton does not necissarily exist
if(prevButton) {
  prevButton.on('click', function() {
      window.location =`/notes/${pageNum-1}?query=${searchBar.value}`
  })
}


