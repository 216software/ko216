ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel) {
        var options = valueAccessor();

        if (options === undefined)
        {
            return false;
        }
        var callback = options.callback;
        var selector_id = options.selector_id || element;
        $(element).keypress(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel, selector_id);
                return false;
            }
            return true;
        });
    }
};

