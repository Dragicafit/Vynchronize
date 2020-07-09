let socket = io.connect("http://127.0.0.1:3000/");
let roomnum = "";
let id = null;
let username = "";
let host = false;
let parseUrlWakanim = /^https:\/\/www\.wakanim\.tv\/(\w*)\/v2\/\w*\/episode\/(\d+)/;
