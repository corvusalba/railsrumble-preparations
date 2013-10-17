var connection = null;

$(function () {
    connection = new WebSocket('ws://localhost:8181/');

    connection.onopen = function () {
        console.log("Opened.");
    };

    connection.onclose = function () {
        console.log("Closed.");
    };

    connection.onerror = function (error) {
        console.log("Error: " + error);
    };

    connection.onmessage = function(e){
        console.log(e.data);
        var event = JSON.parse(e.data);
        itemsViewModel.handle(event);
    };
});
