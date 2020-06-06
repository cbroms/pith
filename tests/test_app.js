/*
test: python -m http.server
main: python3 app.py
*/

function simulate(head, fun_list) {
  fun = head["fun"]; // req
  args = head["args"]; // req
  apply_state = head["apply_state"]; // opt
  if (!apply_state) apply_state = identity;

  socket.emit(fun, args, function(data){});
  socket.on('~'+fun, function(data){
    console.log('test_'+fun, data);
    fun_con(apply_state(data, fun_list));
  });
}


function fun_con(fun_list) {
  var L = fun_list.length;
  if (L == 0) return;
  head = fun_list[0];
  if (L == 1) fun_list = [];
  else fun_list = fun_list.slice(1, L);
  return simulate(head, fun_list);
}


/* APPLY STATE FUNCTIONS */

function identity(state, fun_list) {
  return fun_list;
}


function give_user_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    fun_list[i]["args"]["user_id"] = json._id;
  }
  return fun_list;
}


function give_first_post_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    fun_list[i]["args"]["post_id"] = json.history[0];
  }
  return fun_list;
}


function give_first_block_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    fun_list[i]["args"]["block_id"] = json.blocks[0];
  }
  return fun_list;
}


/* RUN TEST SEQUENCE
 * One thread per test sequence.
 */

function main() {
  var ip_val = 12345;
  /* 
   * Due to the fact that the on-listener repeats, and information is
   * not preserved outside of the on-listener, avoid testing the same 
   * function twice in a sequence. :/
   */
  fun_con([
    {
      "fun": "create_user", 
      "args": {user_id : ip_val},
      "apply_state": give_user_id
    },
    {
      "fun": "create_post",
      "args": {blocks : ["hi", "bye", "yes", "no"]}
    },
    {
      "fun": "get_user",
      "args": {},
      "apply_state": give_first_post_id
    },
    {
      "fun": "get_post",
      "args": {},
      "apply_state": give_first_block_id
    },
    {
      "fun": "get_block",
      "args": {}
    },
    {
      "fun": "block_add_tag",
      "args": {tag : "imablock"}
    },
    {
      "fun": "post_add_tag",
      "args": {tag : "imapost"}
    },
    {
      "fun": "save_post",
      "args": {}
    },
    {
      "fun": "save_block",
      "args": {}
    },
    {
      "fun": "get_users",
      "args": {}
    },
    {
      "fun": "get_posts",
      "args": {}
    },
    {
      "fun": "get_blocks",
      "args": {}
    },
  ]);
}

/* SETUP */
var socket = io('http://localhost:5000');
socket.on('~connect', function(data){});
main()
socket.on('~disconnect', function(){});
