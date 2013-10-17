function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

var ItemsViewModel = function(items) {
    var self = this;

    self.itemToAddText = ko.observable("");
    self.items = ko.observableArray();

    self.addItem = function() {
        var item = {
            id: generateUUID(),
            text: self.itemToAddText()
        }
        self.raise("add", [item])
        self.itemToAddText("");
    };

    self.removeItem = function(item) {
        self.raise("remove", [item]);
    };

    self.handle = function(event) {
        if (event.type == "full") {
            self.items.removeAll();
            for (var i = 0; event.data[i]; i++)
            {
                self.items.push(event.data[i]);
            }
        }
        if (event.type == "remove") {
            var id = event.data[0].id;
            var item = ko.utils.arrayFirst(self.items(), function (i) {
                return id == i.id;
            });
            self.items.remove(item);
        }
        if (event.type == "add") {
            for (var i = 0; event.data[i]; i++)
            {
                self.items.push(event.data[i]);
            }
        }
    }

    self.raise = function(type, data) {
        var event = {
            type: type,
            data: data
        };
        connection.send(JSON.stringify(event));
    }
};

var itemsViewModel = new ItemsViewModel();

$(function () {
    ko.applyBindings(itemsViewModel);
});
