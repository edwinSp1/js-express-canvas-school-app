var msgs = document.querySelectorAll('.other')
for(var ele of msgs) {
  var temp = ele.textContent;
  ele.textContent = '';
  

temp = temp.replaceAll(/<li>/ig, '<p>')
temp = temp.replaceAll(/<ul>/ig, '<p>')
temp = temp.replaceAll(/<ol>/ig, '<p>')
temp = temp.replaceAll(/li>/ig, 'p>')
temp = temp.replaceAll(/ul>/ig, 'p>')
temp = temp.replaceAll(/ol>/ig, 'p>')
  ele.innerHTML = temp;
}