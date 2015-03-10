/**
 * Created by micer on 3/4/15.
 */

var $MyObj = function(){
    this.myForm = undefined;

    var callbackDisplayIP = function(data){
        var handler = document.getElementById("myIP");
        if(handler !== null){
            handler.textContent = "My IP: " + data.origin;
        }
    }
    $.ajax({
        method: "GET",
        dataType: "json",
        url: "https://httpbin.org/get"
    })
        .done(callbackDisplayIP);
}

$MyObj.prototype = {
    addEvent: function(handler, event, fun){
        if(handler !== null){
            handler.addEventListener(event, fun);
        }
    },
    postForm: function(e){
        e.preventDefault();
        var data = this.myForm;
        $.ajax({
            method: "POST",
            dataType: "html",
            url: "https://httpbin.org/post",
            data:data
        })
            .done(function(data){
                document.getElementById("postResult").textContent = data;
                result.classList.add("alert-success");
            })
            .fail(function(jqXHR, textStatus){
                var result = document.getElementById("postResult");
                result.textContent = jqXHR.status + ": " + jqXHR.statusText;
                result.classList.add("alert-danger");
            });
    }
}

var myObj = new $MyObj();
myObj.addEvent(document.getElementById("testPost"), "click", myObj.postForm);
