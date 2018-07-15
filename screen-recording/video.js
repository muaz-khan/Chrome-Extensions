// var src = location.href.split('?src=')[1];
// document.querySelector('video').src = src;

navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
    document.querySelector('video').srcObject = stream;
}).catch(function() {
    alert('Unable to capture your camera.');
});


document.querySelector('button').onclick = function() {
    window.close();
};

function msToTime(s) {
    function addZ(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return addZ(mins) + ':' + addZ(secs);
}

var span = document.querySelector('span');
var startedAt = (new Date).getTime();
var counter = 1;
(function looper() {
    counter ++;

    if(counter % 2 == 0) {
        span.style.color = 'red';
    }
    else {
        span.style.color = 'black';
    }

    var current = (new Date).getTime() - startedAt;
    span.innerHTML = msToTime(current);
    setTimeout(looper, 1000);
})();
