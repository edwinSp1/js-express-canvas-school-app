function findFirstWord(str) {
  return str.split(' ', 1)[0]
}

var dueDates = document.querySelectorAll('.dueDate')


for(var dueDate of dueDates) {
  const date = findFirstWord(dueDate.textContent)
  if(date == 'Today') {
    dueDate.style.color = 'red'
  } else if(date == 'Tomorrow') {
    dueDate.style.color = 'yellow'
  } 
}

// var tasks = document.querySelectorAll('.task')

//removed priority check for inline style