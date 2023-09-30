const docs = document.querySelectorAll('.doc')
const searchButton = document.getElementById('search')
var searchBar = document.getElementById('search-query')
searchButton.addEventListener('click', function() {
  var query = searchBar.value
  query = query.trim().toUpperCase()
  
  for(var doc of docs) {
    var title = doc.children[1].textContent.toUpperCase()
    doc.style.display = 'block';
    console.log(title, query, doc)
    if(!title.startsWith(query)) {
      doc.style.display = 'none';
    }
  }
  
})
const cancelButton = document.getElementById('cancel')
cancelButton.addEventListener('click', function() {
  for(var doc of docs) {
    doc.style.display = 'block';
  }
  searchBar.value = ''
})
const filterContainer = document.getElementById('filter-container')
const filters = filterContainer.childNodes
document.getElementById('apply-filters').addEventListener('click', function() {
  var checked = []
  for(var filter of filters) {
    var child = filter.lastElementChild
    var value = child.value;
    if(child.checked) {
      checked.push(value)
    }
  }
  console.log(checked)
  for(var doc of docs) {
    var category = doc.childNodes[1].lastElementChild.textContent
    if(!checked.includes(category)) {
      doc.style.display = 'none'
    } else {
      doc.style.display = 'block'
    }
  }
})

