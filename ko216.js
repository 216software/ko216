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

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
};

function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
};

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

/* Nice to have a debouncer  -- from underscore.js */
// Matt has no idea what this does or why he should use it.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Global formatter
var format_value  = function(newValue, format, fixed_digits){

    if(newValue == 999999){
        return 'n/a';
    }

    if(fixed_digits == undefined && format == 'percent'){
        fixed_digits = 1;
    }

    newValueAsNum = isNaN(newValue) ? 0 : +newValue,
    valueToWrite = (newValueAsNum.toFixed(fixed_digits || 0).replace(/(\d)(?=(\d{3})+$)/g, '$1,'));

    if (format == 'percent'){
        valueToWrite += '%';
    }
    if (format == 'currency'){
        valueToWrite = '$' + valueToWrite
    }

    if (format == 'euro'){
        valueToWrite = '€' + valueToWrite
    }


    return valueToWrite

};

// Thanks to stack overflow for this one:
// https://stackoverflow.com/questions/40466367/bootstrap-popover-for-a-knockout-data-bind-list
ko.bindingHandlers.popover = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.bindingHandlers.value.init(element, valueAccessor, allBindings);
    var source = allBindings.get('popoverTitle');
    var container = $(element).attr('data-container') || 'body';
    var sourceUnwrapped = ko.unwrap(source);

    if(sourceUnwrapped == 'world'){
        console.log('hi');
    }
    $(element).popover({
      content: valueAccessor(),
      title: sourceUnwrapped,
      container: container
    });
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var value = valueAccessor();
    ko.bindingHandlers.value.update(element, valueAccessor);
  }
}

ko.bindingHandlers.masked_input =  {

  init: function(element, valueAccessor, allBindings, viewModel, bindingContext)   {

        var clean = valueAccessor();

        $(element).keyup(function () {

            if($(element).val() == ""){
                clean($(element).val());
            }
            else{
                clean($(element).cleanVal());
            }
        });

    },

    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var clean = valueAccessor();
        /* We need to trigger the mask function, so let's use paste here
         */

        $(element).val(clean()).trigger("paste");

    }

};

ko.bindingHandlers.masked_input_on_change =  {

  init: function(element, valueAccessor, allBindings, viewModel, bindingContext)   {

        var clean = valueAccessor();

        $(element).change(function () {

            if($(element).val() == ""){
                clean($(element).val());
            }
            else{
                clean($(element).cleanVal());
            }
        });

    },

    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var clean = valueAccessor();
        /* We need to trigger the mask function, so let's use paste here
         */

        $(element).val(clean()).trigger("keyup");

    }

};

phone_number_has_error = function (ph) {
    if (ph != undefined && ph != "" && ph.length != 10) {
        return true;
    }
};

/*
    A money extender
    data-bind like this:
    <span data-bind="money: 1234567.2"></span>
    and it will be formatted like this
    $1,234,567.20
*/

(function(){

    var toMoney = function(num){
        if (num != undefined)
        {
           return (num.toFixed(2).replace(/(\d)(?=(\d{3})+$)/g, '$1,').replace('.', ','));
        }
        else{
            return num;
        }
    };

    var handler = function(element, valueAccessor, allBindings){
        var $el = $(element);
        var method;

        // Gives us the real value if it is a computed observable or not
        var valueUnwrapped = ko.unwrap( valueAccessor() );

        if($el.is(':input')){
            method = 'val';
        } else {
            method = 'text';
        }
        return $el[method]( toMoney( valueUnwrapped ) );
    };

    ko.bindingHandlers.money = {
        update: handler
    };
})();

/*
    A percent extender
    data-bind like this:
    <span data-bind="percent: 67"></span>
    and it will be formatted like this
    67%
*/

(function(){

    var toPercent = function(num){
        if (num != undefined)
        {
           return num + '%';
        }
        else{
            return num;
        }
    };

    var handler = function(element, valueAccessor, allBindings){
        var $el = $(element);
        var method;

        // Gives us the real value if it is a computed observable or not
        var valueUnwrapped = ko.unwrap( valueAccessor() );

        if($el.is(':input')){
            method = 'val';
        } else {
            method = 'text';
        }
        return $el[method]( toPercent( valueUnwrapped ) );
    };

    ko.bindingHandlers.percent = {
        update: handler
    };
})();

/* Custom binding for making modals */
ko.bindingHandlers.bootstrapModal = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var props = valueAccessor(),
            vm = bindingContext.createChildContext(viewModel);
        ko.utils.extend(vm, props);
        vm.close = function () {
            vm.show(false);
            vm.onClose();
        };
        vm.action = function () {
            vm.onAction();
        }
        ko.utils.toggleDomNodeCssClass(element, "modal fade", true);
        ko.renderTemplate("makeAnOfferModal", vm, null, element);
        var showHide = ko.computed(function () {
            $(element).modal(vm.show() ? 'show' : 'hide');
        });
        return {
            controlsDescendantBindings: true
        };
    }
}

/* Custom handler for Bootstrap 3 Datetimepicker */
ko.bindingHandlers.dateTimePicker = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var options = ko.unwrap(valueAccessor());
        var valueObservable = allBindings.get('value');

        var defaults = {
            //defaultDate: valueObservable(), //can't set default here because parsing fails for time strings (ex:  "09:15 AM" throws error)
            format: 'MM/DD/YYYY hh:mm A',
            icons: {
                down: 'fa fa-chevron-down',
                up: 'fa fa-chevron-up'
            },
            stepping: 15,
            sideBySide: false,
            widgetPositioning: {
                horizontal: 'auto',
                vertical: 'auto'
            }
        };

        var config = ko.utils.extend(defaults, options); //override defaults with passed in options
        var $pickerElement = $(element).datetimepicker(config);

        $pickerElement.bind('dp.change', function (eventObj) {
            var picker = $(element).data("DateTimePicker");
            if (picker) {
                var date = picker.date();
                var formattedDate = date ? date.format(picker.format()) : "";
                if (formattedDate != valueObservable()) {
                    valueObservable(formattedDate);
                }
            }
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            var picker = $(element).data("DateTimePicker");
            if (picker) {
                picker.destroy();
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var picker = $(element).data("DateTimePicker");
        if (picker) {
            var valueObservable = allBindings.get('value');
            var date = picker.date();
            var formattedDate = date ? date.format(picker.format()) : "";

            if (formattedDate != valueObservable()) {
                if(valueObservable()){
                    picker.date(valueObservable());
                }
            }
        }

    }
 };

/* Got execute on enter from :
   http://stackoverflow.com/questions/23087721/call-function-on-enter-key-press-knockout-js

   bind like this

   data-bind="executeOnEnter: sendMessage, button : buttonSelector"
*/


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


ko.bindingHandlers.selected = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var selected = ko.utils.unwrapObservable(valueAccessor());
        if (selected) element.select();
    }
};


/* Sort column by column headers and types.

   Check out this jsFiddle http://jsfiddle.net/brendonparker/6S85t/

   Use it like this
   <th data-bind="sort: { arr: Records, prop: 'Name' }">Name</th>
*/

ko.bindingHandlers.sort = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var asc = false;
        element.style.cursor = 'pointer';

        element.onclick = function(){
            var value = valueAccessor();
            var prop = value.prop;
            var data = value.arr;

            asc = !asc;

            data.sort(function(left, right){
                var rec1 = left;
                var rec2 = right;

                if(!asc) {
                    rec1 = right;
                    rec2 = left;
                }

                var props = prop.split('.');
                for(var i in props){
                    var propName = props[i];
                    var parenIndex = propName.indexOf('()');
                    if(parenIndex > 0){
                        propName = propName.substring(0, parenIndex);
                        rec1 = rec1[propName]();
                        rec2 = rec2[propName]();
                    } else {
                        rec1 = rec1[propName];
                        rec2 = rec2[propName];
                    }
                }

                return rec1 == rec2 ? 0 : rec1 < rec2 ? -1 : 1;
            });
        };
    }
};

ko.bindingHandlers.sort_desc = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var asc = false;
        element.style.cursor = 'pointer';

        element.onclick = function(){
            var value = valueAccessor();
            var prop = value.prop;
            var data = value.arr;

            data.sort(function(left, right){
                var rec1 = left;
                var rec2 = right;

                if(!asc) {
                    rec1 = right;
                    rec2 = left;
                }

                var props = prop.split('.');
                for(var i in props){
                    var propName = props[i];
                    var parenIndex = propName.indexOf('()');
                    if(parenIndex > 0){
                        propName = propName.substring(0, parenIndex);
                        rec1 = rec1[propName]();
                        rec2 = rec2[propName]();
                    } else {
                        rec1 = rec1[propName];
                        rec2 = rec2[propName];
                    }
                }

                return rec1 == rec2 ? 0 : rec1 < rec2 ? -1 : 1;
            });
        };
    }
};


/* Fades */
// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};

ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).slideDown() : $(element).slideUp();
    }
};


ko.bindingHandlers.fadeSwitcher = {
    init: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        element.setAttribute('previousValue', value);
        ko.bindingHandlers.text.update(element, ko.observable(value));
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var previousValue = element.getAttribute('previousValue');
        if (value !== previousValue) {
            $(element).fadeOut('fast', function () {
                ko.bindingHandlers.text.update(element, ko.observable(value));
                $(element).fadeIn();
            });
            element.setAttribute('previousValue', value);
        }
    }
};

/* Borrowed this from: https://gist.github.com/tommck/6174395
   Now I can display date strings as moment strings with */
ko.bindingHandlers.moment = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var val = valueAccessor();
        var date = moment(ko.utils.unwrapObservable(val));

        var format = allBindingsAccessor().format || 'MM/DD/YYYY';
        element.innerHTML = date.format(format);
    }
};


function display_news_message (message, alert_level) {

    if (alert_level == "alert-info") {
        toastr.info(message);
    } else if (alert_level == "alert-success") {
        toastr.success(message);
    } else if (alert_level == "alert-danger") {
        toastr.error(message);
    } else if (alert_level == "alert-warning") {
        toastr.warning(message);
    }
};

/* Custom binding for cool svg pie charts */
ko.bindingHandlers.piety = {
    init: function(element, valueAccessor) {
        var options = valueAccessor() || {};
        $(element).peity("pie", options);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (valueAccessor().ratio() !== undefined){
          $(element).text(valueAccessor().ratio() + "/1");
        }
        $(element).change();
    }

};

/* Let's try making an extender!
 *
 * An extender is used in a view model like this:
 *
 * function AppViewModel(one, two) {
 *     this.myNumberOne = ko.observable(one).extend({ numeric: 0 });
 *     this.myNumberTwo = ko.observable(two).extend({ numeric: 2 });
 * }

 * Got this from Knockouts Doc pages: http://knockoutjs.com/documentation/extenders.html
 */
ko.extenders.number_format = function(target, type_of_format) {

    //In this case, format should be one of 'number', 'money', 'percent'
    //create a writable computed observable to intercept writes to our observable

    target.formatted = ko.observable();

    function format(newValue) {

        valueToWrite = format_value(newValue, type_of_format);
        target.formatted(valueToWrite);
    };

    //initial formatting
    format(target());

    //initialize with current value to make sure it is rounded appropriately
    target.subscribe(format);

    //return the new computed observable
    return target;
};


/* Good to have a toggle function available to true/false observables */
ko.observable.fn.toggle = function () {
    var obs = this;
    return function () {
        obs(!obs())
    };
};

/* Slide Visible

   bind like this:
   <div class="panel-body" data-bind="slideVisible:visible">

   see this stackoverflow question: http://stackoverflow.com/questions/19536881/always-use-jquery-slideup-slidedown-in-knockoutjs
*/

ko.bindingHandlers.slideVisible = {
    init: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).toggle(value);
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        value ? $(element).slideDown() : $(element).slideUp();
    }
};


/* Truncating binding grabbed from :
 *
 * https://stackoverflow.com/questions/16317622/knockout-limit-number-of-characters-in-an-observable-field

	bind like this:
	<div data-bind="trimText: myText1, trimTextLength: 10">
 */

ko.bindingHandlers.truncatedText = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var originalText = ko.utils.unwrapObservable(valueAccessor());
            // 10 is a default maximum length
		var truncatedText;
		if (originalText){
        length = ko.utils.unwrapObservable(allBindingsAccessor().maxTextLength) || 20;
        truncatedText = originalText.length > length ? originalText.substring(0, length) + "..." : originalText;
		}
		else{
			truncatedText = '';
		}
        // updating text binding handler to show truncatedText
        ko.bindingHandlers.text.update(element, function () {
            return truncatedText;
        });
    }
};

ko.bindingHandlers.pikaday = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

          var add_date =  valueAccessor();
          var format = allBindings().pikaday_format || 'dd, ll';

          maxDateToday = allBindings().pikaday_maxDateToday || false;
          minDateToday = allBindings().pikaday_maxDateToday || false;

          options = { format: format,
				firstDay: 1,
				position: 'top left',
				field: element,
				onSelect: add_date };

          if (maxDateToday){
              options['maxDate'] = new Date()
          }
          if (minDateToday){
              options['minDate'] = new Date()
          }

		  var pikaday = new Pikaday(options);
          viewModel.pikaday = pikaday;

    },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var value = valueAccessor();
    ko.bindingHandlers.value.update(element, valueAccessor);
  }
};

ko.bindingHandlers.pikadaymoment = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

          // keep a reference to the pikaday
          if(element.pikstore == undefined){
              element.pikstore = [];
          }

          var format = allBindings().pikaday_format || 'dd, ll';
          var value = ko.unwrap(valueAccessor());
          maxDateToday = allBindings().pikaday_maxDateToday || false;
          minDateToday = allBindings().pikaday_minDateToday || false;

          options = { format: format,
				firstDay: 1,
				position: 'top left',
				field: element,
                yearRange: 100,
				onSelect: allBindings().pikaday_adddate,
                onClose: function(){
                    if($(element).val() == ''){
                        this.setDate(null);
                        allBindings().pikaday_adddate(undefined)
                    }
                }};


          if (maxDateToday){
              options['maxDate'] = new Date()
          }
          if (minDateToday){
              options['minDate'] = new Date()
          }


		  var pikaday = new Pikaday(options);

          if (value){
              pikaday.setMoment(moment(value));
          }
          // Store all the pikadays associated with this value
          element.pikstore.push(pikaday);
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    var value = ko.unwrap(valueAccessor());
    //ko.bindingHandlers.value.update(element, valueAccessor);
    if(value != undefined){

        if(element.pikstore){
            for (var i = 0; i < element.pikstore.length; i++){
                 var p = element.pikstore[i];
                 if(p.getMoment().format('MM-DD-YYYY') != value){
                     element.pikstore[i].setMoment(moment(value), false);
                 }
            }
        }
    }
  }
};




var templateFromUrlLoader = {
    loadTemplate: function(name, templateConfig, callback) {
        if (templateConfig.fromUrl) {
            // Uses jQuery's ajax facility to load the markup from a file
            var fullUrl = '/static/components/' + templateConfig.fromUrl + '?cacheAge=' + templateConfig.maxCacheAge;
            $.get(fullUrl, function(markupString) {
                // We need an array of DOM nodes, not a string.
                // We can use the default loader to convert to the
                // required format.
                //
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else {
            // Unrecognized config format. Let another loader handle it.
            callback(null);
        }
    }
};


ko.bindingHandlers.selectPicker = {
    after: ['options'],   /* KO 3.0 feature to ensure binding execution order */
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = ko.unwrap(valueAccessor());

        console.log('selectpicker options');

        $(element).addClass('selectpicker').selectpicker(options);
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        /* KO 3.3 will track any bindings we depend on automagically and call us on changes */
        allBindingsAccessor.get('options');
        allBindingsAccessor.get('optionsText');
        allBindingsAccessor.get('optionsCaption');
        allBindingsAccessor.get('value');
        allBindingsAccessor.get('selectedOptions');

        $(element).selectpicker('refresh');
    }
};

// Register it
ko.components.loaders.unshift(templateFromUrlLoader);




// Google locations component extractor
function extractFromAdress(components, type, shortName){
    for (var i=0; i<components.length; i++)
        for (var j=0; j<components[i].types.length; j++)
            if (components[i].types[j] == type) {
                return shortName ? components[i].short_name : components[i].long_name;
            }
    return "";
}



