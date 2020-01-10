var index_right = document.getElementById("roll-right");
var index_left = document.getElementById("roll-left");
var roller = document.getElementById("roller");
// console.log("left" + roller.style.left)


var flag = true;


index_right.onclick = function() {
    if (flag) {
        var a = roller.offsetLeft - 1073;
        roller.style.left = a + "px";
        roller.style.transition = "1s"
        flag = false
    }



}

index_left.onclick = function() {
    if (!flag) {
        var a = roller.offsetLeft + 1073;
        roller.style.left = a + "px";
        roller.style.transition = "1s"
        flag = true
    }
}





function ajax(data, method, url, success) {
    var ajax = new XMLHttpRequest(); //1
    //get
    if (method == 'get') {
        if (data) {
            url += "?" + data;
        }
        ajax.open(method, url);
        ajax.send();
    } else {
        //post 
        ajax.open(method, url);
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        if (data) {
            ajax.send(data);
        } else {
            ajax.send();
        }
    }

    ajax.onreadystatechange = function() { //4
        if (ajax.readyState == 4 && ajax.status == 200) {
            success(ajax.responseText)

        }
    }
}



function login() {
    layer.open({
        type: 2,
        title: '',
        shadeClose: true,
        shade: 0.8,
        area: ['543px', '336px'],
        content: 'login.html' //iframe的url
    });
}

function reg() {
    layer.open({
        type: 2,
        title: '',
        shadeClose: true,
        shade: 0.8,
        area: ['543px', '336px'],
        content: 'regest.html' //iframe的url
    });
}