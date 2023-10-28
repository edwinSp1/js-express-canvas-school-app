

function formatDate(date) {
  var day = date.getDate().toString().padStart(2, '0');
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var year = date.getFullYear().toString();
  return year + '-' + month + '-' + day;
}
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
//LETS GOOOO we do some bad practices
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function processDate(date) {
  if(date == 'Tomorrow') {
    var today = new Date()
    return formatDate(today.addDays(1))
  }
  if(date == 'Today') {
    return formatDate(new Date())
  }
  if(daysOfWeek.includes(date)) {
    var today = new Date()
    var idx = daysOfWeek.indexOf(date)
    //getDay() returns day of week
    var daysFromNow = idx-today.getDay()
    var newDate = today.addDays(daysFromNow)
    return formatDate(newDate)
  }
  //November 3, 2023
  date = date.split(' ')
  var month = findMonth(date[0])
  date[1] = date[1].slice(0, date[1].length-1)
  var day = date[1]
  var year = date[2]
  return `${year}-${month}-${day}`
}
$.get('/api/getEvents', (data) => {
  /*
  console.log(data)
  displayEvents(data.slice(0, 2))
  var textData = data[2]
  */
  var textData = data['eventData']
  
  var tasks = data['tasks']
  $('#text-view').html(textData['events'])
  var events = document.querySelectorAll('#text-view li div')
  //some events are in different elements but are associated to the same date
  var prevDate;
  var eventTimes = {}
  for(var ele of events) {
    var date;
    for(var e of ele.children) {
      //tagNames are capped
      if(e.tagName == 'H1') {
        date = processDate(e.textContent)

        console.log(e.textContent)
      }
      
      if(!date) date = prevDate
      prevDate = date
      eventTimes[date] = ele.lastElementChild.textContent
    }
  }
  displayEvents(eventTimes, tasks)
  $('#district-msgs').html(textData['msgList'])
})


var res = {}
/**
 * Displays events on the page.
 *
 * @param {Object} events - The events to be displayed.
 * @param {Array<Object>} tasks - The tasks to be displayed.
 * @return {void} 
 */
function displayEvents(events, tasks) {
  for(var date of Object.keys(events)) {
    if(!res[date]) {
      res[date] = {
        modifier: 'bg-red',
        html: `<span>${events[date]}</span>`
      }
    } else {
      res[date].html += `<span>${events[date]}</span>`
    }
  }
  for(var task of tasks) {
    if(!res[task.dueDate]) {
      res[task.dueDate] = {
        modifier: 'bg-red',
        html: `<div>${task.task}</div>`
      }
    } else {
      res[task.dueDate].html += `<div>${task.task}</div>`
    }
  }
/**
 * Displays events on the page.
 *
 * @param {string} events - The events to be displayed.
 * @return {void} 
 */
  function displayEventPopup(events) {
    if(events == '<div>No events for lincoln on this day</div>') return
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
    var event = res[date]
    if(!event) return '<div>No events for lincoln on this day</div>'
    if(!event.html) {
      return '<div>No events for lincoln on this day</div>'
    } 
    
    return event.html
  }

  
  
  const options = {
    settings: {
      visibility: {
        theme: 'dark',
      },
      selection: {
        time: 12,
      },
    },
    actions: {
      /**
       * Handles the click event on a day element.
       *
       * @param {Event} event - The click event object.
       * @param {Array} dates - An array of date values.
       * @return {void} This function does not return a value.
       */
      clickDay(event, dates) {
        //when the user clicks again, it is registered as them disabling it
        var date = dates[0] ? dates[0] : 'unclicked'
        console.log(date)
        if(date == 'unclicked') return
        displayEventPopup(getEventData(date))
      },
      changeTime(event, time, hours, minutes, keeping) {
        /* 
        var time24 = convertTo24Hour(time)
        for(var ele of document.querySelector('#text-view').children) {
          var date = ele.firstElementChild.lastElementChild.innerText.split(' - ')[0]
          console.log(date)
          date = convertTo24Hour(date)
          var in5Hours = date.split('').map((ele) => {
            parseInt(ele, 10)
          })
          in5Hours[0] += 5
          in5Hours = in5Hours.join(':')
          if(isTimeInRange(time24, date, in5Hours)) {
            
            console.log('in range', ele)
          }
        }
        */
      },
    },
    popups: res
  }
  const calendar = new VanillaCalendar('#calendar', options);
  calendar.init();  
  
  document.getElementById('calendar').style.height = window.innerWidth / 1.5 + 'px'
}

/**
 * Converts a time in 12-hour format to 24-hour format.
 *
 * @param {string} time12h - The time in 12-hour format (e.g. "10:30 AM").
 * @return {string} The time in 24-hour format (e.g. "10:30").
 */
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}
/**
 * Determines if a given time is within a specified range.
 *
 * @param {string} time - The time to check in the format HH:MM.
 * @param {string} startTime - The start time of the range in the format HH:MM.
 * @param {string} endTime - The end time of the range in the format HH:MM.
 * @return {boolean} Returns true if the time is within the range, false otherwise.
 */
function isTimeInRange(time, startTime, endTime) {
  console.log(time, startTime, endTime)
  const [hours, minutes] = time.split(':');
  const [startHours, startMinutes] = startTime.split(':');
  const [endHours, endMinutes] = endTime.split(':');
  function calcTimeWeight (hours, minutes) {
    return hours * 60 + parseInt(minutes, 10)
  }
  return calcTimeWeight(hours, minutes) >= calcTimeWeight(startHours, startMinutes) && calcTimeWeight(hours, minutes) <= calcTimeWeight(endHours, endMinutes);
}
