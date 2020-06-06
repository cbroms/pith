/*
function func_con(fun_list) {
  var L = fun_list.length;
  if (L == 0) return;
  head = fun_list[0];
  fun = head[0];
  args = head[1];
  if (L == 1) return fun(args, []);
  return fun(args, fun_list.slice(1, L));
}

function test_two(args, fun_list) {
  console.log(2, args[0], args[1]);
  func_con(fun_list);
}

function test_one(args,fun_list) {
  console.log(1, args);
  func_con(fun_list);
}

func_con([[test_one, 5], [test_two, [6,7]]]);
*/
x = 4
eval("(console.log('hi '+x))");
