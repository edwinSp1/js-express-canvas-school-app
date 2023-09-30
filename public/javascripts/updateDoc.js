
const form = document.getElementById('form')
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = document.getElementById(elmnt.id + 'header')

  header.onmousedown = dragMouseDown;
  

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
const usedNames = new Set();
for(var ele of document.querySelectorAll('.draggable')) {
  dragElement(ele)
  usedNames.add(ele.id)
}

const metaData = document.getElementById('metadata')



form.addEventListener('submit', function(event) {
  event.preventDefault();
  const data = {}
  for(var elemt of document.querySelectorAll('.draggable')) {
    const input = elemt.children[1]
    const name = input.getAttribute('name')
    data[name] = {
      pos: {
        top:elemt.style.top,
        left:elemt.style.left
      },
      size: {
        width: input.style.width,
        height: input.style.height
      }
    }
  }
  console.log(data)
  metaData.value = JSON.stringify(data)
  
  document.forms[0].submit()
})

const newTextArea = document.getElementById('create-new-textarea')
const deleteTextArea = document.getElementById('delete-textarea')
const textAreaName = document.getElementById('textarea-content')
newTextArea.addEventListener('click', function() {
  console.log(usedNames)
  var textBox = document.createElement('div')
  const name = textAreaName.value
  
  if(usedNames.has(name)) return
  usedNames.add(name)
  textBox.setAttribute('id', name)
  textBox.classList.add('draggable')
  textBox.style.top = '300px';
  textBox.innerHTML = `<h1 id="${name}header">${name}</h1><textarea name="${name}"></textarea>`
  form.appendChild(textBox)
  dragElement(textBox)
})
deleteTextArea.addEventListener('click', function() {
  const name = textAreaName.value
  if(name.length == 0) return
  var ele = document.getElementById(name)
  if(ele == null) return
  usedNames.delete(ele.id)
  ele.remove()
})
