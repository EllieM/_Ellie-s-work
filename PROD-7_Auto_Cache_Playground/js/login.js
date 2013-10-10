/* LOGIN */

// localStorage.setItem('foo', JSON.stringify(data));
// JSON.parse(localStorage.getItem('foo'))

var username = "pwadmin";
var password = "pwadmin"; 

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}
