jQuery FormLink
=================
Creates a link to a prefilled form (and populates a form based on one) for easier sharing of prefilled html forms.

At BlackLocus, we have various internal UIs with many inputs that are often shared. This provides
utility to link others to the same html forms prefilled with some specific set of data.



Usage
-----
This will enable one or more forms (as matched by the jQuery selector) with FormLink functionality. If the URL contains
the formlink parameter, the form will be scrolled to (just like a hash #anchor) and filled with the values encoded
in the formlink parameter. Forms should be given a proper `id` attribute, or else FormLink may refuse to meld onto the
form.

    $(form).formlink();

This will generate an &lt;a&gt; at the end of the form with the FormLink.

Alternatively, FormLink may be given a initialization callback function. The function itself receives a handle to
retrieve the FormLink.

    $(form).formlink({
        handle: function(formlink) {
            // We have access to formlink url here. There's a button that
            // when clicked will display the current formlink.
            $('button#formlink-getter').click(function(event) {
                alert(formlink.get());
            });
        }
    });

Currently a FormLink may only pre-fill a single form.


Demo (Test) Page
----------------

https://rawgithub.com/blacklocus/jquery-formlink/master/test.html


License
-------
Copyright 2013 BlackLocus

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the
License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific
language governing permissions and limitations under the License.
