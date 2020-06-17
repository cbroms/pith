/*
test: python -m http.server
main: python3 app.py
*/

function simulate(head, fun_list) {
  fun = head["fun"]; // req
  args = head["args"]; // req
  apply_state = head["apply_state"]; // opt
  if (!apply_state) apply_state = identity;

  if (args) {
    socket.emit(fun, args, (data) => {
      console.log('test_'+fun, data);
      fun_con(apply_state(data, fun_list));
    });
  }
  else {
    socket.emit(fun, (data) => {
      console.log('test_'+fun, data);
      fun_con(apply_state(data, fun_list));
    });
  }
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


function give_discussion_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    // check if will be replaced
    if (fun_list[i]["apply_state"] &&
      fun_list[i]["apply_state"].name.includes("discussion_id")) break;
    if (!fun_list[i]["args"]) continue;
    fun_list[i]["args"]["discussion_id"] = json._id;
  }
  return fun_list;
}


function give_user_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    // check if will be replaced
    if (fun_list[i]["apply_state"] &&
      fun_list[i]["apply_state"].name.includes("user_id")) break;
    if (!fun_list[i]["args"]) continue;
    fun_list[i]["args"]["user_id"] = json._id;
  }
  return fun_list;
}


function give_first_post_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    // check if will be replaced
    if (fun_list[i]["apply_state"] &&
      fun_list[i]["apply_state"].name.includes("post_id")) break;
    if (!fun_list[i]["args"]) continue;
    fun_list[i]["args"]["post_id"] = json.history[0];
  }
  return fun_list;
}


function give_first_block_id(state, fun_list) {
  var json = JSON.parse(state);
  for (var i = 0; i < fun_list.length; i++) {
    // check if will be replaced
    if (fun_list[i]["apply_state"] &&
      fun_list[i]["apply_state"].name.includes("block_id")) break;
    if (!fun_list[i]["args"]) continue;
    fun_list[i]["args"]["block_id"] = json.blocks[0];
  }
  return fun_list;
}


/* RUN TEST SEQUENCE
 * One thread per test sequence.
 */

function main() {
  var ip_val = 12345;
  var ip_val2 = 67890;
  fun_con([
    {
      "fun": "get_discussions",
      "args": null 
    },
    {
      "fun": "create_discussion",
      "args": {},
      "apply_state": give_discussion_id
    },
    {
      "fun": "get_discussion_users",
      "args": {}
    },
    {
      "fun": "get_discussion_posts",
      "args": {}
    },
    {
      "fun": "create_user", 
      "args": {user_id : ip_val},
      "apply_state": give_user_id
    },
    {
      "fun": "join_discussion",
      "args": {}
    },
    {
      "fun": "create_post",
      "args": {blocks : [
        "Whales are great!  I love them!",
        "Whales are my friends. Monkeys are my enemies."
      ]}
    },
    {
      "fun": "get_discussion",
      "args": {},
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
      "fun": "save_discussion",
      "args": {}
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
      "fun": "get_saved_discussions",
      "args": {}
    },
    {
      "fun": "get_saved_posts",
      "args": {}
    },
    {
      "fun": "get_saved_blocks",
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
      "fun": "leave_discussion",
      "args": {}
    },
    {
      "fun": "get_discussions",
      "args": null
    },
    {
      "fun": "get_discussion_users",
      "args": {}
    },
    {
      "fun": "get_discussion_posts",
      "args": {}
    },
    {
      "fun": "create_user", 
      "args": {user_id : ip_val2},
      "apply_state": give_user_id
    },
    {
      "fun": "join_discussion",
      "args": {}
    },
    {
      "fun": "create_post",
      "args": {blocks : [
        "Monkeys are great. Better than whales.",
        "Whales suck.  Monkeys rule."
      ]}
    },
    {
      "fun": "get_discussion",
      "args": {},
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
      "fun": "save_discussion",
      "args": {}
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
      "fun": "get_saved_discussions",
      "args": {}
    },
    {
      "fun": "get_saved_posts",
      "args": {}
    },
    {
      "fun": "get_saved_blocks",
      "args": {}
    },
    {
      "fun": "block_add_tag",
      "args": {tag : "youreablock"}
    },
    {
      "fun": "post_add_tag",
      "args": {tag : "youreapost"}
    },
    {
      "fun": "search",
      "args": {query : "love the sick whales"}
    },
    {
      "fun": "block_remove_tag",
      "args": {tag : "youreablock"}
    },
    {
      "fun": "post_remove_tag",
      "args": {tag : "youreapost"}
    },
    {
      "fun": "leave_discussion",
      "args": {}
    },
    {
      "fun": "get_discussion",
      "args": {},
    },
    {
      "fun": "get_users",
      "args": {},
    },
    {
      "fun": "get_posts",
      "args": {},
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
