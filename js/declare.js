var socket = io.connect("http://localhost:3000/");
var roomnum = ""
var id = "M7lc1UVf-VE"
var username = ""
// Don't allow trailing or leading whitespace!
var nosymbols = new RegExp("^(([a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-])|([a-zA-Z0-9_-]*))$");
