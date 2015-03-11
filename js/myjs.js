/**
 * Created by micer on 3/4/15.
 */

var $MyObj = function(){
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
    postForm: function(){
        var data = $("#myPostForm").serialize();
        var result = document.getElementById("postResult");
        var hasShownAccordion = (function(){
            return result.classList.contains("hidden");
        })();
        if(hasShownAccordion){
            result.classList.remove("hidden");
        }
        result = result.querySelector("div");
        var displayResult = function(data){
            var ul = document.createElement("ul");
            var li = document.createElement("li");
            ul.classList.add("list-group");
            for(var a in data){
                if(data.hasOwnProperty(a)){
                    li = document.createElement("li");
                    li.classList.add("list-group-item");
                    li.classList.add("list-group-item-info");
                    li.textContent = a + ": " + data[a];
                    ul.appendChild(li);
                }
            }
            return ul;
        }
        $.ajax({
            method: "POST",
            dataType: "html",
            url: "https://httpbin.org/post",
            data:data
        })
            .done(function(data){
                result.appendChild(displayResult(JSON.parse(data).form));
                if(hasShownAccordion) {
                    $("#postResult").accordion({
                        collapsible: true,
                        icons: {
                            header: "fa fa-arrow-circle-right",
                            activeHeader: "fa fa-arrow-circle-down"
                        },
                        create: function (event, ui) {
                            result = document.getElementById("postResult");
                            var span = result.querySelector("span");
                            span.classList.remove("ui-icon");
                        }
                    });
                }
            })
            .fail(function(jqXHR, textStatus){
                result.textContent = jqXHR.status + ": " + jqXHR.statusText;
                result.classList.add("alert-danger");
            });
    },
    validateForm: function(){
        var form = $("#myPostForm").validate({
            rules: {
                firstname: "required",
                lastname: "required",
                majorSelect: "required",
                degreeRadioOptions: "required",
                comment: "required"
            },
            messages: {
                firstname: {
                    required: "Please enter your first name!",
                    minlength: "Your name is invalid!"
                },
                lastname: {
                    required: "Please enter your first name!",
                    minlength: "Your name is invalid!"
                },
                majorSelect: "Please choose your major!",
                degreeRadioOptions: "Please choose your degree!",
                comment: "Please comment this!"
            },
            errorPlacement: function(error, element) {
                if (element.is(":radio")){
                    error.appendTo(element.parent().next().next());
                }else{
                    error.appendTo(element.parent());
                }
            }
        });
        if(form.form()){
            return true;
        }

        return false;
    }
}

var myObj = new $MyObj();
myObj.addEvent(document.getElementById("testPost"), "click", function(e){
    e.preventDefault();
    if(myObj.validateForm()){
        myObj.postForm();
    }
});

$(function(){
});