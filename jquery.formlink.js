(function ($) {


    // From http://unixpapa.com/js/querystring.html
    // "you may use this freely in any way without worrying about my copyright at all, and, as usual, it is offered without warrantee"

    // Query String Parser
    //
    //    qs= new QueryString()
    //    qs= new QueryString(string)
    //
    //        Create a query string object based on the given query string. If
    //        no string is given, we use the one from the current page by default.
    //
    //    qs.value(key)
    //
    //        Return a value for the named key.  If the key was not defined,
    //        it will return undefined. If the key was multiply defined it will
    //        return the last value set. If it was defined without a value, it
    //        will return an empty string.
    //
    //   qs.values(key)
    //
    //        Return an array of values for the named key. If the key was not
    //        defined, an empty array will be returned. If the key was multiply
    //        defined, the values will be given in the order they appeared on
    //        in the query string.
    //
    //   qs.keys()
    //
    //        Return an array of unique keys in the query string.  The order will
    //        not necessarily be the same as in the original query, and repeated
    //        keys will only be listed once.
    //
    //    QueryString.decode(string)
    //
    //        This static method is an error tolerant version of the builtin
    //        function decodeURIComponent(), modified to also change pluses into
    //        spaces, so that it is suitable for query string decoding. You
    //        shouldn't usually need to call this yourself as the value(),
    //        values(), and keys() methods already decode everything they return.
    //
    // Note: W3C recommends that ; be accepted as an alternative to & for
    // separating query string fields. To support that, simply insert a semicolon
    // immediately after each ampersand in the regular expression in the first
    // function below.

    function QueryString(qs)
    {
        this.dict= {};

        // If no query string  was passed in use the one from the current page
        if (!qs) qs= location.search;

        // Delete leading question mark, if there is one
        if (qs.charAt(0) == '?') qs= qs.substring(1);

        // Parse it
        var re= /([^=&]+)(=([^&]*))?/g;
        while (match= re.exec(qs))
        {
            var key= decodeURIComponent(match[1].replace(/\+/g,' '));
            var value= match[3] ? QueryString.decode(match[3]) : '';
            if (this.dict[key])
                this.dict[key].push(value);
            else
                this.dict[key]= [value];
        }
    }

    QueryString.decode= function(s)
    {
        s= s.replace(/\+/g,' ');
        s= s.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/g,
            function(code,hex1,hex2,hex3)
            {
                var n1= parseInt(hex1,16)-0xE0;
                var n2= parseInt(hex2,16)-0x80;
                if (n1 == 0 && n2 < 32) return code;
                var n3= parseInt(hex3,16)-0x80;
                var n= (n1<<12) + (n2<<6) + n3;
                if (n > 0xFFFF) return code;
                return String.fromCharCode(n);
            });
        s= s.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/g,
            function(code,hex1,hex2)
            {
                var n1= parseInt(hex1,16)-0xC0;
                if (n1 < 2) return code;
                var n2= parseInt(hex2,16)-0x80;
                return String.fromCharCode((n1<<6)+n2);
            });
        s= s.replace(/%([0-7][0-9A-F])/g,
            function(code,hex)
            {
                return String.fromCharCode(parseInt(hex,16));
            });
        return s;
    };

    QueryString.prototype.value= function (key)
    {
        var a= this.dict[key];
        return a ? a[a.length-1] : undefined;
    };

    QueryString.prototype.values= function (key)
    {
        var a= this.dict[key];
        return a ? a : [];
    };

    QueryString.prototype.keys= function ()
    {
        var a= [];
        for (var key in this.dict)
            a.push(key);
        return a;
    };



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Utility

    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };

    /**
     * @returns {number} that is the hashcode of some string
     */
    String.prototype.hashCode = function() {
        var hash = 0, i, $char;
        if (this.length == 0) return hash;
        for (i = 0, l = this.length; i < l; i++) {
            $char  = this.charCodeAt(i);
            hash  = ((hash<<5)-hash)+$char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    /** turn a form into a js object */
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // jQuery.formlink

    var formLinkParam = 'jquery.formlink';

    // $.serializeArray (on which $.serializeObject is based) only pulls in what we care about for the most part,
    // which is absolutely fantastic and subsidizes a lot of work. There are a few excludes nonetheless, namely,
    // password fields.
    var excludeTypes = [
        'password'
    ];

    $.fn.formlink = function (options) {
        options = options || {};

        // data functions

        function prepareFormData(form) {
            var data = form.serializeObject();

            // Filter out excluded types
            $.each(excludeTypes, function(idx, excludeType) {
                var inputs = form.find('input[type="{0}"][name]'.format(excludeType));
                inputs.each(function (idx, input) {
                    delete data[$(input).attr('name')];
                });
            });

            return data;
        }

        function getFormId(form) {
        }

        function unlinkifyFormData() {
            var queryStr = window.location.search && window.location.search.trim();
            if (queryStr) {
                var queryParams = new QueryString(queryStr);
                var formLinkValue = queryParams.value(formLinkParam);
                if (formLinkValue) {
                    return JSON.parse(formLinkValue);
                }
            }
            return null;
        }

        function linkifyFormData(form) {
            var formId = form.attr('id');
            if (!formId) {
                throw new Error('form element must have an "id"');
            }

            var encodedFormData = encodeURIComponent(JSON.stringify(prepareFormData(form)));

            var protocol = window.location.protocol;
            var host = window.location.host;
            var pathname = window.location.pathname;
            var search = window.location.search ? window.location.search : '?';
            var hash = window.location.hash;

            // merge formlink into query string
            var qs = new QueryString(search);
            if (qs.value(formLinkParam)) {
                // replace existing formLinkParam
                search = '?';
                var keys = qs.keys();

                // This may actually 'fix' bad query params. Ideally formlink wouldn't change them, but considering they're
                // wrong to begin with, formlink best parse and rebuild the query string as best it can.
                $(keys).each(function(idx, key) {
                    if (key == formLinkParam) {
                        // replace it
                        search += formLinkParam + '=' + encodedFormData
                    } else {
                        // maintain existing params
                        search += key + '=' + qs.value(key);
                    }
                });

            } else {
                // append formLinkParam
                if (search.length == 1 || search.charAt(search.length - 1) == '&') {
                    // either just '?' or ends with '&' already
                    search += formLinkParam + '=' + encodedFormData;
                } else {
                    search += '&' + formLinkParam + '=' + encodedFormData;
                }
            }

            return protocol + '//' + host + pathname + search + hash;
        }



        // core logic

        return this.each(function() {
            var $this = $(this);

            // fill whatever form may be encoded in formLinkParam
            var formData = unlinkifyFormData();
            if (formData) {
                $.formlink.applyForm($this, formData);
            }

            function getFormLink() {
                return linkifyFormData($this);
            }

            // attach handles that externalize a FormLink
            if (options.handle) {
                // attach to user-configured
                var formlink = {
                    get: getFormLink,
                    wasLinked: formData && true,
                    form: $this
                };
                options.handle(formlink);

            } else {
                // default to a generated <a>
                var $a = $('<a href="#">FormLink</a>').appendTo($this);

                function refreshFormLink() {
                    // update the href on this auto-generated <a>
                    $a.attr('href', getFormLink());
                }

                // This may cause bad performance, but it will keep the <a href> in sync in case the user decides to
                // "Copy Link Address".
                $this.change(function(jqEvent){
                    refreshFormLink();
                });
                // There are ways to modify forms with triggering change events. Catch it again.
                $a.on('mouseover click', function(jqEvent) {
                    refreshFormLink();
                });
            }
        });
    };



    // public functions

    $.formlink = {
        /**
         * @param {jQuery} $form to populate
         * @param {object} values to apply to form
         */
        applyForm: function($form, values) {
            $form[0].reset();
            $.each(values, function(key, value) {
                var values = [].concat(value);
                var inputs = $form.find('[name="{0}"]'.format(key));

                // restore any previously input values
                if (inputs.is('[type=checkbox]')) {
                    // checkboxes remain annoying to this day

                    var secondaryFill = [];

                    // First tick valued checkboxes.
                    for (var i = 0; i < values.length; i++) {
                        var valueAttr = values[i];
                        if (!inputs.filter('[value="{0}"]:not(:checked):first'.format(valueAttr)).prop('checked', true).size()) {
                            // no match, add it to secondary fill
                            secondaryFill.push(valueAttr);
                        }
                    }

                    // Then tick any un-valued checkboxes with remaining slots.
                    var nonValue = $('[type=checkbox]:not([value])');
                    for (var j = 0; j < secondaryFill.length && j < nonValue.size(); j++) {
                        $(nonValue[j]).prop('checked', true);
                    }

                } else if (inputs.is('[type=radio]')) {
                    // radios remain annoying to this day
                    inputs.filter('[value="{0}"]'.format(value)).prop('checked', true);

                } else if (inputs.is('select[multiple]')) {
                    // Multiple select can take an array directly. In addition if for some reason there are multiple
                    // multiple selects by the same name, this will also take care of that.
                    inputs.val(values);

                } else {
                    inputs.val(function(idx, oldVal) {
                        return values.length > idx ? values[idx] : null;
                    });
                }
            });
        }
    };


})(jQuery);