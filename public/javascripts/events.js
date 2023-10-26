
var findMonth = (month) => {
  switch (month) {
    case 'January':
      return 1
    case 'February':
      return 2
    case 'March':
      return 3
    case 'April':
      return 4
    case 'May':
      return 5
    case 'June':
      return 6
    case 'July':
      return 7
    case 'August':
      return 8
    case 'September':
      return 9
    case 'October':
      return 10
    case 'November':
      return 11
    case 'December':
      return 12
  }
}
function processDate(date) {
  //Thursday, July 25, 2022
  var date = date.split(', ').slice(1)
  // [July 25, 2022]
  var monthDay = date[0].split(' ')
  var month = findMonth(monthDay[0])
  var day = monthDay[1]
  var year = date[1]
  return `${year}-${month}-${day}`
}
$.get('/api/getEvents', (data) => {
  displayEvents(data)
})
function displayEvents(data) {

  console.log(data)
  var res = {}
  function displayEvents(events) {
    var ele = document.createElement('dialog')
    ele.innerHTML += '<button id="close" style="display:block">close</button>'
    ele.innerHTML += events
    document.body.appendChild(ele)
    ele.showModal()
    ele.firstElementChild.addEventListener('click', () => {
      ele.close()
    })
  } 
  function getEventData(date) {
    var event = data.find((event) => processDate(event.date) == date)
    if(!event) return '<div>No events for lincoln on this day</div>'
    if(!event.events) {
      return '<div>No events for lincoln on this day</div>'
    } 
    
    return event.events
  }
  data.forEach((event) => {
    var date = processDate(event.date)
    if(!event.events) {
      return
    }
    res[date] = {
      modifier: 'bg-red',
      html: `<span>${event.events}</span>`
    }
  })
  console.log(res)
  
  const options = {
    actions: {
      clickDay(event, dates) {
        //when the user clicks again, it is registered as them disabling it
        var date = dates[0] ? dates[0] : 'unclicked'
        displayEvents(getEventData(date))
      },
    },
    popups: res
  }
  const calendar = new VanillaCalendar('#calendar', options);
  calendar.init();  
  
  document.getElementById('calendar').style.height = window.innerWidth / 1.5 + 'px'
}
