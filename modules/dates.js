exports.formatDate = function(date) {
  const today = new Date();
  const tomorrow = new Date(); //in a comparison
  let dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  tomorrow.setDate(tomorrow.getDate() + 1);
  //  	console.log(today.toDateString());
  // console.log(tomorrow.toDateString());
  // console.log(date.toDateString());
  if (today.toDateString() == date.toDateString()) {
    dateString = `Today`;
  } else if (tomorrow.toDateString() == date.toDateString()) {
    dateString = `Tomorrow`;
  }

  return `${dateString} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` //theres no tomorrow here


}
exports.formatDateNoHour = function(date) {
  const today = new Date();
  const tomorrow = new Date(); //in a comparison
  let dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  tomorrow.setDate(tomorrow.getDate() + 1);
 

  return dateString
}

exports.inRange = function(dueDateMs, dayRange) {
  const today = new Date().getTime();
  const adjustedTimeAsMs1 = dueDateMs - (1000 * 60 * 60 * 24 * dayRange);
  const adjustedTimeAsMs2 = dueDateMs + (1000 * 60 * 60 * 24 * dayRange);
  return today >= adjustedTimeAsMs1 && today <= adjustedTimeAsMs2
}
//there
function sameDay(d1, d2) {
  return d1.getFullYear() == d2.getFullYear()
    && d1.getMonth() == d2.getMonth()
    && d1.getDate() == d2.getDate()
}
function isTomorrow(d1, d2) {
  return d1.getFullYear() == d2.getFullYear()
    && d1.getMonth() == d2.getMonth()
    && d1.getDate() == d2.getDate() - 1
}
exports.sameDay = sameDay
/**
 * Converts a given date into a string in the format "YYYY-MM-DD".
 *
 * @param {Date} date - The date to be processed.
 * @return {string} The processed date string in the format "YYYY-MM-DD".
 */
function processDate(date) {
  var day = date.getDate().toString().padStart(2, '0');
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var year = date.getFullYear().toString();
  return year + '-' + month + '-' + day;
}
exports.processDate = processDate