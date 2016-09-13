function push() {
	var userInfo = {
    receiver: '1',
    content: 'hello',
    uid: '1'
  };
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/pushEvent",
    data: userInfo,
    success: loginSuccess
      // dataType: 'application/json'
  });
}

function loginSuccess(data) {
	console.log(data);
}
