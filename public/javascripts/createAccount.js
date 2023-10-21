var googleAccData;

const link = window.location.origin
document.querySelector('form').onsubmit = function(e) {
  e.preventDefault()
  ele = e.target || e.srcElement 
  for (var p in googleAccData) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', googleAccData[p]);
    ele.appendChild(input);
  }
  ele.submit()
  ele.lastElementChild.disabled=true;
}
if(!(window.location.hash == '')) { 
  var raw = window.location.hash.slice(1).split('&').map(str => str.split('='))
  var json = {}
  for(var [x, y] of raw) {
      json[x] = y
  }
  $.post('/googleAcc', json, function(data, success) {
    
    googleAccData = data
  }).fail(() => {
    alert('Google Account Already Exists')
    window.location = '/home'
    return
  })
} else {
  gAccLogin()
}
/*
* Create form to request access token from Google's OAuth 2.0 server.
*/
function gAccLogin() {
  alert('As Of 10/20/23, All users will need to verify their google accounts.')
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);
  
  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {'client_id': '116333806998-rkspnljblle2c2a9hj35inq5ti8lpunp',
                'redirect_uri': `${link}/adduser`,
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/userinfo.email',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}