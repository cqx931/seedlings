var save = false;

function datamuse(params, callback) {
  var query = "";
  for (var item in params) {
    query += item + "=" + params[item] + "&"
  }
  console.log(query)
  $.ajax({
    url: "https://cqx931.pythonanywhere.com/datamuse?" + query,
    type: 'GET',
    tryCount: 0,
    retryLimit: 3,
    success: function(data) {
      callback(data);
      if (save) {
        console.log("save")
        var data = "{name: 'Bob', occupation: 'Plumber'}";
        var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
        window.open(url, '_blank')
      }
    },
    error: function(xhr, textStatus, errorThrown) {
      if (textStatus == 'timeout' || xhr.status == 500) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
          $.ajax(this);
          return;
        }
        callback("error");
        $('.message').html("Oops, please try another seed.")
      } else {
        //handle error
        callback("error")
      }
    }
  });

  // var ajax = $.get(
  //     "http://127.0.0.1:5000/datamuse?" + query,
  //     function(data) {
  //       callback(data);
  //       if (save) {
  //         console.log("save")
  //         var data = "{name: 'Bob', occupation: 'Plumber'}";
  //         var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
  //         window.open(url, '_blank')
  //       }
  //     }
  // )
  // .fail(function(){
  //   console.log("request error, try again")
  //
  // });
}

var test = {
  "word": "justice",
  "domain": "juice",
  "type": "plant"
}
