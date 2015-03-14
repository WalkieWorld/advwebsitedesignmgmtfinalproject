/**
 * Created by micer on 3/4/15.
 */

var $MyObj = function(){
    this.webInfo = [
        { "first name": "Hao" },
        { "last name": "Zhang" },
        { course: "Advanced Website Design and Management"}
    ];

    this.flickr = {
        parameterObj: {
            user_id: "131882319@N03",
            format: "json",
            api_key: "825d81f91ec9858b536687a2efe8a1f7",
            method: undefined
        },
        basicUrl: "https://api.flickr.com/services/rest/?"
    };

    var mainBody = document.getElementsByClassName("main-body")[0];
    this.placeAlbumHandler = mainBody.querySelector(".container");
}

$MyObj.prototype = {
    get getCurrentFile(){
        var url = window.location.pathname;
        var filename = url.substring(url.lastIndexOf('/')+1);
        return filename;
    },
    get getCurrentIP() {
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
    },
    addEvent: function(handler, event, fun){
        if(handler !== null){
            handler.addEventListener(event, fun);
        }
    },
    displayPostForm: function(data){
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
    },
    postForm: function(){
        var that = this;
        var data = $("#myPostForm").serialize();
        var result = document.getElementById("postResult");
        var hasShownAccordion = (function(){
            return result.classList.contains("hidden");
        })();
        if(hasShownAccordion){
            result.classList.remove("hidden");
        }
        result = result.querySelector("div");
        $.ajax({
            method: "POST",
            dataType: "html",
            url: "https://httpbin.org/post",
            data:data
        })
            .done(function(data){
                result.appendChild(that.displayPostForm(JSON.parse(data).form));
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
    },
    set setWebInfo(data){
        if(window.localStorage){
            data.forEach(function(curVal, index, arr){
                for(var key in curVal){
                    localStorage.setItem(key, curVal[key]);
                }
            });
        }else{
            throw "The browser doesn't support localStorage";
        }

    },
    retrieveWebInfo: function(key){
        if(window.localStorage){
            return localStorage.getItem(key);
        }
        throw "The browser doesn't support localStorage";
    },
    displayWebInfo: function(key, value){
        var section = document.createElement("section");
        var label = document.createElement("label");
        var article = document.createElement("article");
        var p = document.createElement("p");
        section.classList.add("form-group");
        label.classList.add("col-sm-2");
        label.classList.add("control-label");
        label.textContent = key;
        article.classList.add("col-sm-10");
        p.classList.add("form-control-static");
        p.textContent = value;
        article.appendChild(p);
        section.appendChild(label);
        section.appendChild(article);
        return section;
    },
    generateUrl: function(method){
        var parameters = "";
        this.flickr.parameterObj.method = method;
        for(var e in this.flickr.parameterObj){
            parameters += e + "=" + this.flickr.parameterObj[e] + "&";
        }
        return this.flickr.basicUrl + parameters + "jsoncallback";
    },
    get getAlbumList(){
        var that = this;
        $.ajax({
            method: "GET",
            dataType: "jsonp",
            jsonp: 'jsoncallback',
            url: that.generateUrl("flickr.photosets.getList")
        })
            .done(function(data){
                new Promise(function(resolve, reject){
                    resolve(data);
                }).then(function(d){
                    that.displayAlbumList(d, document.getElementById("albumList"));
                    that.addEvent(document.getElementById("albumSelect"),"change", function(e){
                        if(e.target.value !== ""){
                            var albumLocation = that.placeAlbumHandler.querySelector("section[class='row']");
                            if(albumLocation !== null){
                                albumLocation.remove();
                            }
                            that.getAlbum(e.target.value, "flickr.photosets.getPhotos");
                        }
                    });
                }, null);
            })
            .fail(function(jqXHR, textStatus){
                alert(jqXHR.status + ": " + jqXHR.statusText + ": " + textStatus);
            });
    },
    displayAlbumList: function(data, parentNode){
        var albumList = data.photosets.photoset;
        var select = document.createElement("select");
        var option = document.createElement("option");
        select.classList.add("form-control");
        select.id = "albumSelect";
        select.appendChild(option);
        albumList.forEach(function(curVal, index, arr){
            option = document.createElement("option");
            option.textContent = curVal.title._content;
            option.value = curVal.id;
            select.appendChild(option);
        });
        parentNode.appendChild(select);
    },
    getAlbum: function(albumId, method){
        var that = this;
        this.flickr.parameterObj["photoset_id"] = albumId;
        $.ajax({
            method: "GET",
            dataType: "jsonp",
            jsonp: 'jsoncallback',
            url: that.generateUrl(method)
        })
            .done(function(data){
                new Promise(function(resolve, reject){
                    resolve(data);
                }).then(function(d){
                        var section = document.createElement("section");
                        section.classList.add("row");
                        $.each(d.photoset.photo,function(index, curVal){
                            section = that.displayAlbum(curVal, section);
                            that.placeAlbumHandler.appendChild(section);
                        });
                    }, null);
            })
            .fail(function(jqXHR, textStatus){
                alert(jqXHR.status + ": " + jqXHR.statusText + ": " + textStatus);
            });
        delete this.flickr.parameterObj["photoset_id"];
    },
    displayAlbum: function(data, handler){
        "use strict"
        var that = this;
        var bsrc = "https://farm" + data.farm + ".staticflickr.com/" + data.server + "/" + data.id + "_" + data.secret + "_b" + ".jpg";
        var div = document.createElement("div");
        var a = document.createElement("a");
        var figure = document.createElement("figure");
        var img = document.createElement("img");
        div.classList.add("col-xs-6");
        div.classList.add("col-md-3");
        a.href = "#";
        a.setAttribute("data-src", bsrc);
        a.setAttribute("data-toggle", "modal");
        a.setAttribute("data-target", "#largeImage");
        new Promise(function(resolve, reject){
            resolve(data.title);
        }).then(function(d){
                that.addEvent(a, "click", function(e){
                e.preventDefault();
                var p = document.getElementById("viewImage");
                if(p.hasChildNodes()){
                    p.removeChild(p.firstChild);
                }
                var figure = document.createElement("figure");
                var img = document.createElement("img");
                document.getElementById("imageTitle").textContent = d;
                img.src = e.currentTarget.dataset.src;
                figure.appendChild(img);
                p.appendChild(figure);
            });
        }, null);
        figure.classList.add("thumbnail");
        img.src = "https://farm" + data.farm + ".staticflickr.com/" + data.server + "/" + data.id + "_" + data.secret + ".jpg";
        img.id = data.id;
        figure.appendChild(img);
        a.appendChild(figure);
        div.appendChild(a);
        handler.appendChild(div);
        return handler;
    }
}

var myObj = new $MyObj();

$(function(){
    myObj.getCurrentIP;

    switch (myObj.getCurrentFile){
        case "":
        case "index.html":
            myObj.setWebInfo = myObj.webInfo;
            $("#retrieveContent").on("click", function(e){
                e.preventDefault();
                $("#retrieveContent").parent().next("article").removeClass("hidden");
                if($("#webInfoForm").empty()) {
                    myObj.webInfo.forEach(function (curVal, index, arr) {
                        for (var e in curVal) {
                            $("#webInfoForm").append(myObj.displayWebInfo(e, myObj.retrieveWebInfo(e)));
                        }
                    });
                }
            });
            break;
        case "contact.html":
            myObj.addEvent(document.getElementById("testPost"), "click", function(e){
                e.preventDefault();
                if(myObj.validateForm()){
                    myObj.postForm();
                }
            });
            break;
        case "gallery.html":
            myObj.getAlbumList;

            break;
        default :
            break;
    }
});