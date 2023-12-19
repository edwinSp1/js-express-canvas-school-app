
console.time('logins')
console.time('recent')
console.time('userInfo')
$.get('/api/canvas/getLogins', function(data) {
  console.log(data)
  var $loginContainer = $('<div>')
  var logins = data.map((login) => `
    <p>----------</p>
    <p>Event Type: <span class='event-login'>${login.event_type}</span></p>
    <p>Login Id: <span class='event-login'>${login.id}</span></p>
    <p>Time: <span class='event-login'>${login.created_at}</span></p>
    <p>----------</p>
  `).join('\n')
  $loginContainer.html(logins)
  $('#profile').append($loginContainer)
  console.timeEnd('logins')
})
$.get('/api/canvas/getRecent', function(data) {
  console.log(data)
  
  var messages = data.map((message) => {
    var title = `<h1><a href=${message.url} style='text-decoration:none' target = _blank>${message.title}${message.course ? `(${message.course})` : ''}</a></h1>`
    return `
      ${title}
      <p style='color:blue;'>${message.date ? message.date : 'no date'}</p>
      <p class='other'>${message.message ? message.message : 'no message'}</p>
      ${message.type == 'Submission' ? `<p>Grade: ${message.grade}</p>` : ''}
    `
  }).join('\n')
  console.log(messages)
  $('#message-container').html(messages)
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
  console.timeEnd('recent')
})
$.get('/api/canvas/getUserInfo', function(data) {
  var $profileContainer = $('#profile')
  console.log($profileContainer)
  console.log(data)
  $profileContainer.prepend(`
    <h1>${data.name}</h1>
    <img src=${data.img_url} title='prof-image' style='width:10em; height:10em;'></img>
  `)
  console.timeEnd('userInfo')
})