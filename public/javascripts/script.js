function glitchLetters(id) {
  console.log(document.getElementById('reduceMovement').textContent)
  if(document.getElementById('reduceMovement').textContent == 'true') {
    return
  }
  const letters = 'abcedefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ1234567890'
  var quote = document.getElementById(id)
  var intervals = 0;
  var l = letters.length;
  var orig = quote.textContent
  var intervals = 0;
  const interval = setInterval(() => {
    quote.textContent = quote.textContent.split("")
    .map((char, idx) => {
      if(idx <= intervals) return orig[idx]
      return letters[Math.floor(Math.random() * l)]
    })
    .join("")
    intervals += 1
    if(intervals >= orig.length) clearInterval(interval)
  }, 30)
}

glitchLetters('quote-text')
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
var other = document.querySelectorAll('.other')
for(var ele of other) {
  var temp = ele.textContent;
  ele.textContent = '';
  

temp = temp.replaceAll(/<li>/ig, '<p>')
temp = temp.replaceAll(/<ul>/ig, '<p>')
temp = temp.replaceAll(/<ol>/ig, '<p>')
temp = temp.replaceAll(/li>/ig, 'p>')
temp = temp.replaceAll(/ul>/ig, 'p>')
temp = temp.replaceAll(/ol>/ig, 'p>')
  console.log(temp);
  ele.innerHTML = temp;
}  

var recentContainer = document.getElementById('recent-container'),
    overdueContainer = document.getElementById('overdue-container');

$.get('/api/getCanvasAssignments', function(data, status) {
  var recent = data.todo
  var overdue = data.overdue;
  for(var val of recent) {
    val.other = val.other ? val.other : 'No description'
    var link = val.type == 'canvasAssignment' ? '<a href="/canvasIntegrationInfo"><i class="fa-solid fa-circle-exclamation FA-icon"></i></a>' : `<a href="/todo/remove/ ${val._id}"><i class="fa-solid fa-xmark FA-icon"></i></a>`
    recentContainer.innerHTML += `
      <div class='task'>
        <h1 style='display:inline'> ${val.task}</h1>
        ${link}
        <p class="dueDate">${val.dueDate}</p>
        <p class="other">${val.other}</p>
      </div>
    `
  }
  for(var val of overdue) {
    val.other = val.other ? val.other : 'No description'
    var link = val.type == 'canvasAssignment' ? '<a href="/canvasIntegrationInfo"><i class="fa-solid fa-circle-exclamation FA-icon"></i></a>' : `<a href="/todo/remove/ ${val._id}"><i class="fa-solid fa-xmark FA-icon"></i></a>`
    overdueContainer.innerHTML += `
      <div class='task'>
        <h1 style='display:inline'>${val.task}</h1>
        ${link}
        <p class="dueDate">${val.dueDate}</p>
        <p class="other">${val.other}</p>
      </div>
    `
  }
})
