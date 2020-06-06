// python -m http.server in test
// python3 app.py in main
var socket = io('http://localhost:5000');
socket.on('~connect', function(data){console.log(data)});
socket.emit('get_users', {}, function(data){console.log(data)})
socket.on('~get_users', function(data){console.log(data)});
socket.on('~disconnect', function(){});
