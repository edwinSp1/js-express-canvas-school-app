var notifyTime;
var req = new XMLHttpRequest();
req.open('GET', '/api/notifyTime', true);
req.send();
req.onload = () => notifyTime = req.responseText
async function wait(time) {
  await new Promise((resolve) => setTimeout(resolve, time));
}
function toHourMinFormat (time) {
  return time.getHours() + ':' + time.getMinutes();
}
function compareTimes (time1, time2) {
  const [hours1, minutes1] = time1.split(':');
  const [hours2, minutes2] = time2.split(':');
  return parseInt(hours1, 10) * 60 + parseInt(minutes1, 10) - parseInt(hours2, 10) * 60 - parseInt(minutes2, 10);
}
async function notifiedToday() {
  
}
checkIfNotificationTime()
async function checkIfNotificationTime() {
  
  while(true) {
    await wait(1000)
    // promise hast been fulfilled yet
    if(!notifyTime) continue
    if(Math.abs(compareTimes(notifyTime, toHourMinFormat(new Date()))) < 10) break;
  }
  notifyUser()
}

function notify(notification) {
  const options = { 
    body: notification,
    data: {
      url: "https://chen31.com/info/events",
      status: "open",
    },
    icon: "https://chen31.com/images/raindrop.ico",
  };
  const n = new Notification("Recent activity", options);
  n.onclick = function(event) {
    event.preventDefault();
    window.open("https://chen31.com/info/events");
  }
}
function notifyUser () {

  const res = new XMLHttpRequest();
  //FOR ANYONE WHO READS THIS CODE SRY FOR NESTING
  res.open("GET", "/api/getNotifications", true);
  res.send(); 
  res.onload = function() {
    const data = JSON.parse(res.responseText);
    var notif = data['notification'];
    
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      notify(notif);
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          notify(notif);
        }
      });
    }
  }
}