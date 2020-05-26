var socket = io.connect("http://127.0.0.1:3000/");
var roomnum = "";
var id = null;
var username = "";
var host = false;
var parseUrlWakanim = /^https:\/\/www\.wakanim\.tv\/(\w*)\/v2\/\w*\/episode\/(\d+)/;
