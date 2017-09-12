Overview
========

``bdajax`` provides JavaScript helper functions and a simple dispatcher system 
driven by XML-attributes. Attributes are defined in its own XML namespace, 
placed in the XHTML markup.

The dispatcher basically provides two behaviors

- trigger events
- perform actions

Behaviors are bound to JavaScript events.

This package bundles required resources for the use of bdajax inside a
``pyramid`` or ``zope`` application. It does NOT include the
required server implementations. bdajax can be used with other Python or 
non-Python server backends too as long as action performing code is implemented
and available through browser URL.

.. contents::
    :depth: 2


Dispatching
-----------

The main paradigm is the use of an ``event/listener`` model. It enables bdajax 
to ``listen`` to ``events`` and trigger ``events`` on ajaxified DOM components.

Consider a navtree as example; the idea is to trigger an event when a navigation
item gets clicked. Click semantically indicates a changed context. Then listen 
to this event on all DOM elements to get notified on changing server context.

This makes it possible to have completely decoupled "sub-applications" knowing
nothing but an event contract from each other.


Attributes
----------

Following attributes are available:

**ajax:bind="evt1 evt2"**
    Indicate bdajax behavior on DOM element and the event(s) triggering
    it/them.

**ajax:event="evt1:sel1 evt2:sel2"**
    Trigger event(s) on selector. The triggered event gets the target
    as additional parameter on event.ajaxtarget.

**ajax:action="name1:selector1:mode1 name2:selector2:mode2"**
    Perform AJAX action(s) on selector with mode. Selector points to target
    DOM element, mode defines how to modify the DOM tree. Possible
    mode values are ``inner`` and ``replace``.

**ajax:target="http://fubar.org?param=value"**
    AJAX target definition. Consists out of target context URL and a
    query string used for requests on the target context.
    ``ajax:target`` is mandatory when ``ajax:event`` is defined, and
    optional when ``ajax:action`` is defined (depends on if event is triggered
    by bdajax or browser event).

**ajax:confirm="Do you really want to do this?"**
    Show confirmation dialog before actually executing actions and trigger
    events.

**ajax:overlay="actionname:selector:content_selector"**
    Renders ajax action to overlay with selector. ``selector`` is optional and
    defaults to ``#ajax-overlay``. ``content_selector`` is optional to 
    ``selector`` and defaults to ``.overlay_content``.

**ajax:overlay-css="additional-overlay-css-class"**
    Additional CSS class which is added when overlay is opened and removed
    as soon as overlay is closed.

**ajax:form="True"**
    Indicate AJAX form. Valid only on ``form`` elements. Value gets ignored.

**ajax:path="/some/path"**
    Sets the browser URL path and pushes history state if supported by browser.
    If value is ``href``, path gets taken from ``href`` attribute. If value is
    ``target`` path gets taken from event ``ajaxtarget`` or ``ajax:target``
    attribute. Otherwise value is taken as defined.

    On ``popstate`` event bdajax executes the definitions written to state
    object. The state object consists of ``target``, ``action`` and ``event``
    attributes. Execution behaves the way described at ``ajax:action`` and
    ``ajax:event``.

    Target gets taken from ``ajax:path-target`` if set, otherwise falls back
    to target from event ``ajaxtarget`` or ``ajax:target``. If
    ``ajax:path-target`` set with empty value, target gets taken from ``path``.

    Action gets taken from ``ajax:path-action`` if set, otherwise falls back
    to ``ajax:action``. If ``ajax:path-action`` set with empty value, action
    execution on history state change can be suppressed even if ``ajax:action``
    is set.

    Event gets taken from ``ajax:path-event`` if set, otherwise falls back
    to ``ajax:event``. If ``ajax:path-event`` set with empty value, event
    triggering on history state change can be suppressed even if ``ajax:event``
    is set.

    Overlay gets taken from ``ajax:path-overlay`` if set, otherwise falls back
    to ``ajax:overlay``. If ``ajax:path-overlay`` set with empty value, overlay
    triggering on history state change can be suppressed even if
    ``ajax:overlay`` is set.

    Additional CSS class for overlay gets taken from ``ajax:path-overlay-css``
    if set, otherwise falls back to ``ajax:overlay-css``.

    If no action and no event and no overlay defined on history state change,
    bdajax performs a redirect to target.

    Bdajax appends the request parameter ``popstate=1`` to requests made by
    history browsing. This is useful to determine on server side whether to
    skip setting ajax path as continuation definition.

**ajax:path-target="http://fubar.org?param=value"**
    Can be used in conjunction with ``ajax:path``.

**ajax:path-action="name1:selector1:mode1"**
    Can be used in conjunction with ``ajax:path``.

**ajax:path-event="evt1:sel1"**
    Can be used in conjunction with ``ajax:path``.

**ajax:path-overlay="actionname:selector:content_selector"**
    Can be used in conjunction with ``ajax:path``.

**ajax:path-overlay-css="actionname:selector:content_selector"**
    Can be used in conjunction with ``ajax:path``.

.. note::

    No selectors containing spaces are supported!


Provide dependencies on server
------------------------------

This package already includes resource configuration for ``Zope`` and
``pyramid``. This is done by ZCML. Include the following ZCML include statement
to your ZCML configuration:

.. code-block:: xml

    <include package="bdajax" />

The expected ``ajaxaction`` view is not provided. Its intended to be provided by 
a custom implementation. See 'Perform actions' below.


Load dependencies in markup
---------------------------

Load bdajax related Scripts:

.. code-block:: html

    <!--
      include jquery 1.7+.
    -->
    <script src="http://code.jquery.com/jquery-1.7.js"></script>

    <!--
      overlay could be included via jquerytools bundle or overlay.js directly
    -->
    <script src="http://fubar.com/++resource++bdajax/overlay.js"></script>

    <!--
      bdajax related Javascript.
    -->
    <script src="http://fubar.com/++resource++bdajax/bdajax.js"></script>

    <!--
      optionally add bootstrap 3 overlay hook if bootstrap is used.
    -->
    <script src="http://fubar.com/++resource++bdajax/bdajax_bs3.js"></script>

Load bdajax related CSS:

.. code-block:: html

    <!--
      bdajax related default styles.
    -->
    <link href="http://fubar.com/++resource++bdajax/bdajax.css"
          rel="stylesheet" type="text/css" media="screen" />

    <!--
      optionally use bootstrap 3 bdajax related styles if bootstrap is used.
      no need to include default styles in this case.
    -->
    <link href="http://fubar.com/++resource++bdajax/bdajax_bs3.css"
          rel="stylesheet" type="text/css" media="screen" />

Make sure the content of ``bdajax.pt`` or ``bdajax_bs3.pt`` is rendered in
Markup.


Define namespace
----------------

In order to keep your XHTML valid when using the XML namespace extension define 
this namespace in the XHTML document:

.. code-block:: html

    <html xmlns="http://www.w3.org/1999/xhtml"
          xmlns:ajax="http://namesspaces.bluedynamics.eu/ajax">
        ...
    </html>


Event binding
-------------

Indicate bdajax behavior on DOM element:

.. code-block:: html

    <a href="http://fubar.com"
       ajax:bind="keydown click">
      fubar
    </a>

Binds this element to events ``keydown`` and ``click``.


Trigger events
--------------

Bind event behavior to DOM element:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:event="contextchanged:.contextsensitiv"
       ajax:target="http://fubar.com/baz?a=a">
      fubar
    </a>

This causes the ``contextchanged`` event to be triggered on all DOM elements
defining ``contextsensitiv`` css class. The extra attribute ``ajaxtarget`` gets
written to the event before it is triggered, containing definitions from
``ajax:target``.


Set URL path
------------

Set path directly, triggers event on history state change:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:path="/some/path"
       ajax:path-event="contextxhanged:#layout">
      fubar
    </a>

Take path from target, performs action on history state change:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:path="target"
       ajax:path-action="layout:#layout:replace">
      fubar
    </a>

Take path from href attribute, trigger overlay:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:path="href"
       ajax:path-overlay="acionname:#custom-overlay:.custom_overlay_content">
      fubar
    </a>


Perform actions
---------------

An action performs a JSON request to the server and modifies the DOM tree as
defined.

bdajax expects a resource (i.e a zope/pyramid view or some script) named  
``ajaxaction`` on server. Resource is called on target url with target query 
parameters. Three additional arguments are passed:

**bdajax.action**
    name of the action

**bdajax.selector**
    given selector must be added to response. Can be ``NONE``, which means
    that no markup is manipulated after action (useful i.e. in combination with
    continuation actions and events).

**bdajax.mode**
    the manipulation mode. Either ``inner`` or ``replace`` or ``NONE``
    (see above).

The resource is responsible to return the requested resource as a JSON
response in the format as follows:

.. code-block:: js

    {
        mode: 'inner',             // the passed mode
        selector: '#someid',       // the passed selector
        payload: '<div>...</div>', // the rendered action
        continuation: [{}],        // continuation actions, events and messages
    }


Action continuation
~~~~~~~~~~~~~~~~~~~

The ``continuation`` value defines an array of tasks which should
be performed after an ajax action returns. Available continuation
definitions are described below.

**actions**:

.. code-block:: js

    {
        'type': 'action',
        'target': 'http://example.com',
        'name': 'actionname',
        'mode': 'inner',
        'selector': '.foo'
    }

**events**:

.. code-block:: js

    {
        'type': 'event',
        'target': 'http://example.com',
        'name': 'eventname',
        'selector': '.foo'
    }

**path**:

.. code-block:: js

    {
        'type': 'path',
        'path': '/some/path',
        'target': 'http://example.com/some/path',
        'action': 'actionname:.selector:replace',
        'event': 'contextchanged:#layout',
        'overlay': 'acionname:#custom-overlay:.custom_overlay_content',
        'overlay_css': 'some-css-class'
    }

**overlay**:

.. code-block:: js

    {
        'type': 'overlay',
        'action': 'actionname',
        'selector': '#ajax-overlay',
        'content_selector': '.overlay_content',
        'css': 'some-css-class',
        'target': 'http://example.com',
        'close': false
    }

Overlays dynamically get a close button. In order to keep overlay contents
easily alterable inside the overlay element an element exists acting as overlay
content container. ``content_selector`` defines the selector of this container.

Setting close to ``true`` closes overlay at ``selector``. In this case
``action`` and target are ignored.

**messages**:

.. code-block:: js

    {
        'type': 'message',
        'payload': 'Text or <strong>Markup</strong>',
        'flavor': 'error',
        'selector': null,
    }

Either ``flavor`` or ``selector`` must be given.
Flavor could be one of 'message', 'info', 'warning', 'error' and map to the
corresponding bdajax UI helper functions. Selector indicates to hook returned
payload at a custom location in DOM tree instead of displaying a message. In
this case, payload is set as contents of DOM element returned by selector.

If both ``flavor`` and ``selector`` are set, ``selector`` is ignored.

Be aware that you can provoke infinite loops with continuation actions and
events, use this feature sparingly.


Trigger actions directly
~~~~~~~~~~~~~~~~~~~~~~~~

Bind an action which is triggered directly:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:action="renderfubar:.#fubar:replace"
       ajax:target="http://fubar.com/baz?a=a">
      fubar
    </a>

On click the DOM element with id ``fubar`` will be replaced by the results of 
action ``renderfubar``. Request context and request params are taken from 
``ajax:target`` definition.


Trigger actions as event listener
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Bind an action acting as event listener. See section 'Trigger events'.
A triggered event indicates change of context on target with params. 
Hereupon perform some action:

.. code-block:: html

    <div id="content"
         class="contextsensitiv"
         ajax:bind="contextchanged"
         ajax:action="rendercontent:#content:inner">
      ...
    </div>

Note: If binding actions as event listeners, there's no need to define a target
since it is passed along with the event.


Multiple behaviors
------------------

Bind multiple behaviors to the same DOM element:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:event="contextchanged:.contextsensitiv"
       ajax:action="rendersomething:.#something:replace"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:path="/some/path">
      fubar
    </a>

In this example on click event ``contextchanged`` is triggered, action
``rendersomething`` is performed and URL path ``/some/path`` get set.


Confirm actions
---------------

Bdajax can display a confirmation dialog before performing actions or trigger
events:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:event="contextchanged:.contextsensitiv"
       ajax:action="rendersomething:.#something:replace"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:confirm="Do you really want to do this?">
      fubar
    </a>

If ``ajax:confirm`` is set, a modal dialog is displayed before dispatching is
performed.


Overlays
--------

Ajax actions can be rendered to overlay directly by using ``bdajax:overlay``:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname">
      fubar
    </a>

This causes bdajax to perform action ``acionname`` on context defined in
``ajax:target`` and renders the result to an overlay element.

In addition a selector for the overlay can be defined. This is useful if
someone needs to display multiple overlays:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname:#custom-overlay">
      fubar
    </a>

Optional to a custom overlay selector a content container selector can be
defined:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname:#custom-overlay:.custom_overlay_content">
      fubar
    </a>

Overlays can be closed by setting special value ``CLOSE`` at ``bdajax:overlay``,
optionally with colon seperated overlay selector:

.. code-block:: html

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:overlay="CLOSE:#custom-overlay">
      fubar
    </a>


JavaScript API
==============


Messages, infos, warnings and errors
------------------------------------

``bdajax`` displays application messages in a jQuery tools overlay. 

``bdajax.message`` displays a plain message. ``bdajax.info`` ``bdajax.warning`` 
and ``bdajax.error`` decorates message with appropriate icon:

.. code-block:: js

    bdajax.message('I am an application Message');


Overlay
-------

Load ajax action contents into an overlay:

.. code-block:: js

    var overlay_api = bdajax.overlay({
        action: 'actionname',
        target: 'http://foobar.org?param=value',
        selector: '#ajax-overlay',
        content_selector: '.overlay_ontent',
        css: 'additional_overlay_css_class'
    });

``selector`` is optional and defaults to ``#ajax-overlay``.

``content_selector`` is optional to ``selector`` and defaults to
``overlay_ontent``.

Default overlay and default overlay content selector can be overwritten at
``bdajax.default_overlay_selector`` respective
``bdajax.default_overlay_content_selector``.

``css`` is optional and can be used to set a CSS class to overlay
DOM element on open. This class gets removed as soon as overlay is closed.

Optionally to ``target``, ``url`` and ``params`` can be given as options to
the function. If both, ``target`` and ``url/params`` given, ``target`` is used.

Ajax overlays can be closed by passing ``close`` option to ``bdajax.overlay``.
When closing an overlay, overlay selector is considered as well from options
if given, otherwise ``bdajax.default_overlay_selector`` is used.

.. code-block:: js

    bdajax.overlay({
        close: true,
        selector: '#ajax-overlay'
    });

``bdajax.overlay`` supports an ``on_close`` callback in options.

.. code-block:: js

    var on_close = function() {
        // do something
    }
    bdajax.overlay({
        action: 'actionname',
        target: 'http://foobar.org?param=value',
        on_close: on_close
    });


Modal dialog
------------

Render a modal dialog inside an overlay. The function expects an options object
and a callback function, which gets executed if user confirms dialog. The
callback gets passed the given options object as well. ``message`` is mandatory
in options:

.. code-block:: js

    var options = {
        message: 'I am an application Message'
    };
    bdajax.dialog(options, callback);


URL operations
--------------

parseurl
~~~~~~~~

Parse hyperlinks for base URL:

.. code-block:: js

    bdajax.parseurl('http://fubar.org?param=value');

This results in:

.. code-block:: js

    'http://fubar.org'


parsequery
~~~~~~~~~~

Parse hyperlinks for request parameters:

.. code-block:: js

    bdajax.parsequery('http://fubar.org?param=value');

This results in:

.. code-block:: js

    { param: 'value' }

The raw query as string can be parsed by additionally passing ``true`` to
``parsequery``::

.. code-block:: js

    bdajax.parsequery('http://fubar.org?param=value', true);

This results in::

.. code-block:: js

    '?param=value'


parsepath
~~~~~~~~~

Parse hyperlinks for path without base URL::

.. code-block:: js

    bdajax.parsepath('http://fubar.org/some/path?param=value');

This results in::

.. code-block:: js

    '/some/path'

The query can be included by additionally passing ``true`` to ``parsepath``::

.. code-block:: js

    bdajax.parsepath('http://fubar.org/some/path?param=value', true);

This results in::

.. code-block:: js

    '/some/path?param=value'


parsetarget
~~~~~~~~~~~

Parse all information at once by calling ``parsetarget``:

.. code-block:: js

    bdajax.parsetarget('http://fubar.org/some/path?param=value');

This result in:

.. code-block:: js

    {
        url: 'http://fubar.org/some/path',
        params: { param: 'value' },
        path: '/some/path',
        query: '?param=value'
    }


XMLHTTPRequest convenience
--------------------------

``bdajax.request`` function is convenience for XMLHTTPRequests. By default 
it sends requests of type ``html`` and displays a ``bdajax.error`` message if 
request fails:

.. code-block:: js

    bdajax.request({
        success: function(data) {
            // do something with data.
        },
        url: 'foo',
        params: {
            a: 'a',
            b: 'b'
        },
        type: 'json',
        error: function() {
            bdajax.error('Request failed');
        }
    });

Given ``url`` might contain a query string. It gets parsed and written to 
request parameters. If same request parameter is defined in URL query AND 
params object, latter one rules.

Options:

**success**
    Callback if request is successful.

**url**
    Request url as string.

**params (optional)**
    Query parameters for request as Object. 

**type (optional)**
    ``xml``, ``json``, ``script``, or ``html``.

**error (optional)**
    Callback if request fails.

Success and error callback functions are wrapped in ``bdajax.request`` to
consider ajax spinner handling automatically.


Perform action
--------------

Sometimes actions need to be performed inside JavaScript code. 
``bdajax.action`` provides this:

.. code-block:: js

    var target = bdajax.parsetarget('http://fubar.org?param=value');
    bdajax.action({
        name: 'content',
        selector: '#content',
        mode: 'inner',
        url: target.url,
        params: target.params
    });

Options:

**name**
    Action name
    
**selector**
    result selector
    
**mode**
    action mode
    
**url**
    target url
    
**params**
    query params


Trigger events
--------------

Sometimes events need to be triggered manually. Since bdajax expects the
attribute ``ajaxtarget`` on the received event a convenience is provided.

Target might be a URL, then it gets parsed by the trigger function:

.. code-block:: js

    var url = 'http://fubar.org?param=value';
    bdajax.trigger('contextchanged', '.contextsensitiv', url);

Target might be object as returned from ``bdajax.parsetarget``:

.. code-block:: js

    var url = 'http://fubar.org?param=value';
    var target = bdajax.parsetarget(url);
    bdajax.trigger('contextchanged', '.contextsensitiv', target);


Set URL path
------------

To set URL path:

.. code-block:: js

    bdajax.path({
        path: '/some/path',
        target: 'http://example.com/some/path',
        action: 'layout:#layout:replace',
        event: 'contextchanged:#layout',
        overlay: 'actionname',
        overlay_css: 'additional-overlay-css-class'
    });

``bdajax.path`` also accepts a ``replace`` option. If given browser history
gets reset.

.. code-block:: js

    bdajax.path({
        path: '/some/path',
        target: 'http://example.com/some/path',
        action: 'layout:#layout:replace',
        replace: true
    });


Ajax forms
----------

Forms must have ``ajax:form`` attribute or CSS class ``ajax`` (deprecated)
set in order to be handled by bdajax:

.. code-block:: html

    <form ajax:form="True"
          id="my_ajax_form"
          method="post"
          action="http://example.com/myformaction"
          enctype="multipart/form-data">
      ...
    </form>

Ajax form processing is done using a hidden iframe where the form gets
triggered to. The server side must return a response like so on form submit:

.. code-block:: html

    <div id="ajaxform">

        <!-- this is the rendering payload -->
        <form ajax:form="True"
              id="my_ajax_form"
              method="post"
              action="http://example.com/myformaction"
              enctype="multipart/form-data">
          ...
        </form>

    </div>

    <script language="javascript" type="text/javascript">

        // get response result container
        var container = document.getElementById('ajaxform');

        // extract DOM element to fiddle from result container
        var child = container.firstChild;
        while(child != null && child.nodeType == 3) {
            child = child.nextSibling;
        }

        // call ``bdajax.render_ajax_form`` on parent frame (remember, we're in
        // iframe here). ``render_ajax_form`` expects the result DOM element,
        // the ``selector``, the fiddle ``mode`` and ``continuation``
        // definitions which may be used to perform ajax continuation.
        parent.bdajax.render_ajax_form(child, '#my_ajax_form', 'replace', {});

    </script>

If ``div`` with id ``ajaxform`` contains markup, it gets rendered to
``selector`` (#my_ajax_form) with ``mode`` (replace). This makes it possible
to rerender forms on validation error or display a success page or similar.
Optional bdajax continuation definitions can be given.

Again, bdajax does not provide any server side implementation, it's up to you
providing this.

.. warning::

    As of bdajax 1.10 the continuation definitions are passed directly
    to ``render_ajax_form`` instead of calling ``bdajax.continuation``. This is
    necessary because ``render_ajax_form`` removes the hidden iframe after
    processing to prevent useless browser history entries. Please adopt your
    server side code when updating to version 1.10.


3rd party javascript
--------------------

Integration of custom JavaScript to the binding mechanism of bdajax is
done via ``bdajax.register``. The register function takes a function and
a boolean flag whether to immediately execute this function as arguments.

The passed binder function gets called every time bdajax hooks up some markup
and gets passed the changed DOM part as ``context``::

.. code-block:: js

    (function($) {

        var custom_binder = function(context) {
            $('mysel', context).on('click', function() { ... });
        };

        $(document).ready(function() {
            bdajax.register(custom_binder, true);
        });

    })(jQuery);


Migration from old style registered binders
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Prior to bdajax 1.9, binder functions were registered by directly manipulating
``bdajax.binders`` object. While this still works, it's not supposed to be
used any more.

When migrating to ``bdajax.register``, be aware that the context of ``this``
changes if binder function is member of a global object. To ensure proper
execution, the binder function should be bound manually to the object it gets
executed in, or the code should be adopted.

Thus, migrating code registering ``myob.binder`` as bdajax binder looks like
so:

.. code-block:: js

    (function($) {

        var myob = {
            binder: function(context) {
                // ``this`` is expected to refer to ``myob``
            }
        }

        $(document).ready(function() {
            // old way of binding
            bdajax.binders.myob_binder = myob.binder;

            // new way of binding if context of ``this`` should be kept
            bdajax.register(myob.binder.bind(myob));
        });

    })(jQuery);


Browsers
========

bdajax is tested with common modern browsers:

- Firefox
- IE
- Edge
- Chome
- Safari

If you find bugs or inconsistencies please report them on github.


Contributors
============

- Robert Niederreiter (Author)
- Attila Oláh
- Johannes Raggam
