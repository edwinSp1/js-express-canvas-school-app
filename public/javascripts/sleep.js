function parseTime(timeStr) {
  //get the hour and minute
  console.log(timeStr)
  var timeComponents = timeStr.split(':')
  var hour = timeComponents[0]
  var minute = timeComponents[1].slice(0, 2)
  return [Number(hour), Number(minute)]
}
const sleepTimes = document.querySelectorAll('.sleepTime')
const wakeTimes = document.querySelectorAll('.wakeTime')

const scheduledSleep = parseTime(document.getElementById('sleep').textContent)
const scheduledWake = parseTime(document.getElementById('wake').textContent)

for(var sleepTime of sleepTimes) {
  var actualSleep  = parseTime(sleepTime.textContent)
  if(actualSleep[0] > scheduledSleep[0]) {
    sleepTime.style.color = 'red'
  } else if(actualSleep[1] > scheduledSleep[1]) {
    sleepTime.style.color = 'red'
  } else {
    sleepTime.style.color = 'green'
  }
}
for(var wakeTime of wakeTimes) {
  var actualWake  = parseTime(wakeTime.textContent)
  if(actualWake[0] > scheduledWake[0]) {
    wakeTime.style.color = 'red'
  } else if(actualWake[1] > scheduledWake[1]) {
    wakeTime.style.color = 'red'
  } else {
    wakeTime.style.color = 'green'
  }
}