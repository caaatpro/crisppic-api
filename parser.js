var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var requesrUrl = 'http://localhost:7000/movie/kinopoisk/';
var authKey = 'dGVzdDp0ZXN0';
var i = 65;
parser ();
function parser () {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', requesrUrl+i, true);
      xhr.setRequestHeader('Authorization', 'Basic '+authKey);
      xhr.send();
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;

        if (xhr.status != 200) {
          console.log(xhr.status + ': ' + xhr.statusText);
        } else {
          console.log(xhr.responseText);
        }
        i++;
        parser();
      };

}
