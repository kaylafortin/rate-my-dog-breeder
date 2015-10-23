$('button').click(function(){

var formData = new FormData();
var fileInputElement = document.getElementById("imageInput")
// console.log($(fileInputElement).val())
// console.log($(fileInputElement))
// console.log($(fileInputElement)[0])
// console.log($(fileInputElement)[0].files[0])
formData.append("name", $(fileInputElement).val())
formData.append("file", $(fileInputElement)[0].files[0]);
// var content = '<a id="a"><b id="b">hey!</b></a>'; // the body of the new file...
// var blob = new Object ([content], { type: "text/xml"});

// formData.append("webmasterfile", blob);

formData.append("container", "rate-my-dog-breeder-review-images")

var request = new XMLHttpRequest();
request.open("POST", "https://rate-my-dog-breeder-hennigk.c9.io/api/containers/upload");
request.send(formData);

})