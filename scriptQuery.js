// $.get('http://stackoverflow.com/', function(page){
//      $(page).find('a[href]').each(function(){
//         console.debug(this.href);
//     });
// });
// function setHeader(xhr) {
//   xhr.setRequestHeader('Access-Control-Allow-Origin');
// }
var xhr = new XMLHttpRequest();
$.ajax({
  url: "http://www.ckc.ca/Choosing-a-Dog/PuppyList/Breeder.aspx?id=1000",
  method: "GET",
  crossDomain: true,
  dataType: "HTML",
  headers: {"Access-Control-Allow-Origin": '*'},
  beforeSend: function(xhr) {
    xhr.overrideMimeType("text/plain; charset=x-user-defined")
    // xhr.setResponseHeader("Access-Control-Allow-Origin", "*");
  }
}).done(function(contents) {
  console.log(contents)
}).error(function(e){
    console.log(e)
});

// var xhr = new XMLHttpRequest();
// xhr.open("GET", "http://www.ckc.ca/Choosing-a-Dog/PuppyList/Breeder.aspx?id=1000", true);
// xhr.setRequestHeader("Accept", "*");
// xhr.onload = function () {
//     console.log(xhr.responseText);
// };
// xhr.send();
