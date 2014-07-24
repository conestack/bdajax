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

For those who know KSS (Kinetic Style Sheets) and TAL (Tag Attribute Language);
The syntax reminds of TAL - attributes are interpreted by JS instead of a TAL
interpreter - while the functionality is inspired by KSS.

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

**ajax:path="/some/path"**
    Sets the browser URL path. If value is ``target`` path gets taken
    from ajax target.

**ajax:action="name1:selector1:mode1 name2:selector2:mode2"**
    Perform AJAX action(s) on selector with mode. Selector points to target
    DOM element, mode defines how to modify the DOM tree. Possible
    mode values are ``inner`` and ``replace``.

**ajax:target="http://fubar.org?param=value"**
    AJAX target definition. Consists out of target context URL and a
    query string used for requests on the target context.
    ``ajax:target`` is mandatory when ``ajax:event`` is defined, and
    optional when ``ajax:action`` is defined (depends on if event is triggered
    by bdajax or browser event). See below to get a clue what i am
    talking about.

**ajax:confirm="Do you really want to do this?"**
    Show confirmation dialog before actually executing actions and trigger
    events.

**ajax:overlay="actionname:selector:content_selector"**
    Renders ajax action to overlay with selector. ``selector`` is optional and
    defaults to ``#ajax-overlay``. ``content_selector`` is optional to 
    ``selector`` and defaults to ``.overlay_content``.

**ajax:form="True"**
    Indicate AJAX form. Valid only on ``form`` elements. Value gets ignored.

**NOTE** - No selectors containing spaces are supported at the moment!


Provide dependencies on server
------------------------------

This package already includes resource configuration for ``Zope`` and
``pyramid``. This is done by ZCML. Include the following ZCML include statement
to your ZCML configuration::

    <include package="bdajax" />

The expected ``ajaxaction`` view is not provided. Its intended to be provided by 
a custom implementation. See 'Perform actions' below.


Load dependencies in markup
---------------------------

Load bdajax related Scripts::

    <!--
      include jquery 1.6.4+.
    -->
    <script src="http://code.jquery.com/jquery-1.6.4.js"></script>

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

Load bdajax related CSS::

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
this namespace in the XHTML document::

    <html xmlns="http://www.w3.org/1999/xhtml"
          xmlns:ajax="http://namesspaces.bluedynamics.eu/ajax">
        ...
    </html>


Event binding
-------------

Indicate bdajax behavior on DOM element::

    <a href="http://fubar.com"
       ajax:bind="keydown click">
      fubar
    </a>

Binds this element to events ``keydown`` and ``click``.


Trigger events
--------------

Bind event behavior to DOM element::

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

Set path directly::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:path="/some/path">
      fubar
    </a>

Take path from target::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:path="target">
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
    given selector must be added to response. could be ``NONE``, which means
    that no Markup is hooked after action (useful i.e. in combination with
    continuation actions and events).

**bdajax.mode**
    the manipulation mode. Either ``inner`` or ``replace`` or ``NONE``
    (see above).

The resource is responsible to return the requested resource as a JSON
response in the format as follows.::

    {
        mode: 'inner',             // the passed mode
        selector: '#someid',       // the passed selector
        payload: '<div>...</div>', // the rendered action
        continuation: [{}],        // continuation actions, events and messages
    }


Action continuation
~~~~~~~~~~~~~~~~~~~

The ``continuation`` value is an array of actions and/or events which should
be performed after performed ajaxaction returns. Available continuation
definitions are described below.

**actions**::

    {
        'type': 'action',
        'target': 'http://example.com',
        'name': 'actionname',
        'mode': 'inner',
        'selector': '.foo'
    }

**events**::

    {
        'type': 'event',
        'target': 'http://example.com',
        'name': 'eventname',
        'selector': '.foo'
    }

**path**::

    {
        'type': 'path',
        'path': '/some/path'
    }

**overlay**::

    {
        'type': 'overlay',
        'selector': '#ajax-overlay',
        'content_selector': '.overlay_content',
        'action': 'actionname',
        'target': 'http://example.com',
        'close': false
    }

Overlays dynamically get a close button. In order to keep overlay contents
easily alterable inside the overlay element an element exists acting as overlay
content container. ``content_selector`` defines the selector of this container.

Setting close to ``true`` closes overlay at ``selector``. In this case
``action`` and target are ignored.

**messages**::

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

Bind an action which is triggered directly.::

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
Hereupon perform some action.::

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

Bind multiple behaviors to the same DOM element::

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
events::

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

Ajax actions can be rendered to overlay directly by using ``bdajax:overlay``::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname">
      fubar
    </a>

This causes bdajax to perform action ``someaction`` on context defined in
``ajax:target`` and renders the result to an overlay element.

In addition a selector for the overlay can be defined. This is useful if
someone needs to display multiple overlays::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname:#custom-overlay">
      fubar
    </a>

Optional to a custom overlay selector a content container selector can be
defined::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:target="http://fubar.com/baz?a=a"
       ajax:overlay="acionname:#custom-overlay:.custom_overlay_content">
      fubar
    </a>


JavaScript API
==============


Messages, infos, warnings and errors
------------------------------------

``bdajax`` displays application messages in a jQuery tools overlay. 

``bdajax.message`` displays a plain message. ``bdajax.info`` ``bdajax.warning`` 
and ``bdajax.error`` decorates message with appropriate icon.::

    bdajax.message('I am an application Message');


Overlay
-------

Load ajax action contents into an overlay.::

    var overlay_api = bdajax.overlay({
        action: 'actionname',
        target: 'http://foobar.org?param=value',
        selector: '#ajax-overlay',
        content_selector: '.overlay_ontent'
    });

``selector`` is optional and defaults to ``#ajax-overlay``.
``content_selector`` is optional to ``selector`` and defaults to
``overlay_ontent``.

Optionally to ``target``, ``url`` and ``params`` can be given as options to
the function. If both, ``target`` and ``url/params`` are given,
``target`` rules.


Modal dialog
------------

Render a modal dialog inside an overlay. The function expects an options object
and a callback function, which gets executed if user confirms dialog. The
callback gets passed the given options object as well. ``message`` is mandatory
in options.::

    var options = {
        message: 'I am an application Message'
    };
    bdajax.dialog(options, callback);


URL operations
--------------

Parse hyperlinks for base URL or request parameters::

    bdajax.parseurl('http://fubar.org?param=value');

results in::

    'http://fubar.org'

while::

    bdajax.parsequery('http://fubar.org?param=value');

results in::

    { param: 'value' }

Do both at once by calling ``parsetarget``::

    bdajax.parsetarget('http://fubar.org?param=value');

This result in::

    {
        url: 'http://fubar.org',
        params: { param: 'value' }
    }


XMLHTTPRequest convenience
--------------------------

``bdajax.request`` function is convenience for XMLHTTPRequests. By default 
it sends requests of type ``html`` and displays a ``bdajax.error`` message if 
request fails::

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
``bdajax.action`` provides this::

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

Target might be a URL, then it gets parsed by the trigger function::

    var url = 'http://fubar.org?param=value';
    bdajax.trigger('contextchanged', '.contextsensitiv', url);

Target might be object as returned from ``bdajax.parsetarget``::

    var url = 'http://fubar.org?param=value';
    var target = bdajax.parsetarget(url);
    bdajax.trigger('contextchanged', '.contextsensitiv', target);


Set URL path
------------

To set URL path::

    var path = '/some/path';
    bdajax.path(path);


Ajax forms
----------

Forms must have ``ajax:form`` attribute or CSS class ``ajax`` (deprecated)
set in order to be handled by bdajax::

    <form ajax:form="True"
          id="my_ajax_form"
          method="post"
          action="http://example.com/myformaction"
          enctype="multipart/form-data">
      ...
    </form>

Ajax form processing is done using a hidden iframe where the form gets
triggered to. The server side must return a response like so on form submit::

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

        // call ``bdajax.render_ajax_form`` and ``bdajax.continuation`` on
        // parent frame (remember, we're in iframe here). ``render_ajax_form``
        // expects the result DOM element, the ``selector`` and the fiddle
        // ``mode``. ``continuation`` may be used to perform ajax
        // continuation as described earlier in this document.
        parent.bdajax.render_ajax_form(child, '#my_ajax_form', 'replace');
        parent.bdajax.continuation({});

    </script>

If ``div`` with id ``ajaxform`` contains markup, it gets rendered to
``selector`` (#my_ajax_form) with ``mode`` (replace). This makes it possible
to rerender forms on validation error or display a success page or similar.
Optional bdajax continuation definitions can be given to
``parent.bdajax.continuation``.

Again, bdajax does not provide any server side implementation, it's up to you
providing this.


3rd party javascript
--------------------

When writing applications, one might use its own set of custom JavaScripts
where some actions need to be bound in the markup. Therefore the ``binders`` 
object on ``bdajax`` is intended. Hooking a binding callback to this object 
results in a call every time bdajax hooks some markup.::

    mybinder = function (context) {
        jQuery('mysel').bind('click', function() { ... });
    }
    bdajax.binders.mybinder = mybinder;


Browsers
========

bdajax is tested with:

- Firefox 3.5, 3.6 and up
- IE 7, 8
- Chome 7
- Safari 5


Contributors
============

- Robert Niederreiter (Author)
- Attila Oláh


Changes
=======

1.6.0.dev0
----------

- Change order of available overlays in template.
  [rnix, 2014-07-24]

- Add ``ajax:path functionality``.
  [rnix, 2014-07-22]

- Add bdajax integration template and styles and overlay hook script for
  Twitter Bootstrap 3.
  [rnix, 2014-07-04]

- Update Ajax Spinner Image.
  [rnix, 2014-07-03]


1.5.2
-----

- Do not display error message if XHR request gets aborted (e.g. click
  a url while request is pending)
  [rnix]


1.5.1
-----

- Ajax forms are now marked via ``ajax:form``. Setting ``ajax`` CSS class still
  works, but is deprecated.
  [rnix, 2013-02-04]


1.5.0
-----

- Refactor ``bdajax.trigger`` to create a separate event instace for each
  element returned by selector.
  [rnix, 2013-08-14]

- Include customized ``overlay.js`` of jquery tools. Two Reasons; We only need
  overlay of jquery tools; jquery tools development is pretty slow in migrating
  newer jQuery versions and not compatible with jquery >= 1.9 (yet).
  [rnix, 2013-08-13]

- Update to Jquery 1.9.x
  [rnix, 2013-08-13]

1.4.2
-----

- ``bdaja.trigger`` also accepts object as returned by ``bdajax.parsetarget``
  as target argument.
  [rnix, 2012-10-28]

1.4.1
-----

- Explicit render ``about:blank`` in hidden form response iframe src.
  [rnix, 2012-08-06]

1.4
---

- Nicer spinner image.
  [rnix, 2012-05-21]

- Add ``overlay`` continuation support.
  [rnix, 2012-05-04]

- Extend ``ajax:overlay`` to accept an optional overlay and content selector.
  [rnix, 2012-05-04]

- Add AJAX form support.
  [rnix, 2012-05-04]

1.3
---

- All overlays not positional fixed for now.
  [rnix, 2011-12-02]

- jQuery 1.6.4 and jQuery Tools 1.2.6.
  [rnix, 2011-12-01]

- Add ``ajax:overlay`` functionality.
  [rnix, 2011-11-30]

- Call ``event.stopPropagation`` in ``bdajax._dispatching_handler``.
  [rnix, 2011-11-23]

1.2.1
-----

- Use CSS 'min-width' instead of 'width' for messages.
  [rnix, 2011-09-07]

1.2
---

- Add ``bdajax.fiddle`` function.
  [rnix, 2011-04-28]

- Delete overlay data from DOM element before reinitializing.
  [rnix, 2011-04-21]

- Add ``ajax:confirm`` functionality.
  [rnix, 2011-04-20]

- Strip trailing '/' in ``bdajax.parseurl`` to avoid double slashes.
  [rnix, 2011-04-19]

- Add continuation messages.
  [rnix, 2011-04-12]

1.1
---

- Set focus on ok button for dialog boxes, so a user can dismiss the button by
  pressing return key.
  [aatiis, 2011-03-25]

- Don't define a default error callback twice, just rely on the default handler
  prowided by ``bdajax.request``.
  [aatiis, 2011-03-25]

- Add default 403 error page redirect.
  [aatiis, 2011-03-25]

- Hide spinner after 'Empty response' message.
  [aatiis, 2011-03-25]

- Used ``request.status`` and ``request.statusText`` in default error if they
  are defined.
  [aatiis, 2011-03-25]

- Continuation action and event support for ajaxaction.
  [rnix, 2011-03-21]

- Better default error output.
  [rnix, 2011-03-13]

- Remove ``ajaxerrors`` and ``ajaxerror`` from bdajax.
  [rnix, 2011-03-13]

- Remove bfg.zcml and zope.zcml, switch to pyramid in configure.zcml with
  conditional resource registration.
  [rnix, 2011-02-07]

1.0.2
-----

- Rebind bdajax global if element is not found by selector after replace
  action.
  [rnix, 2011-01-14]

1.0.1
-----

- Add spinner handling.
  [rnix, 2010-12-13]

- Return jquery context by ``jQuery.bdajax``.
  [rnix, 2010-12-13]

1.0
---

- Remove call behaviour.
  [rnix, 2010-12-04]

- Browser testing.
  [rnix, 2010-12-04]

1.0b4
-----

- Add ``configure.zcml`` containing all configuration using
  ``zcml:condition``.
  [rnix, 2010-11-16]

- Remove overlay data of modal dialog before reloading. otherwise callback
  options are cached.
  [rnix, 2010-11-09]

- Disable ajax request caching by default in ``bdajax.request``.
  [rnix, 2010-11-09]

- Add modal dialog to bdajax.
  [rnix, 2010-11-09]

- Mark ``ajax:call`` API deprecated. Will be removed for 1.0 final.
  [rnix, 2010-11-09]

1.0b3
-----

- Add class ``allowMultiSubmit`` to fit a plone JS contract.
  [rnix, 2010-07-01]

- Fix bug in bdajax.request when finding url including query params.
  [rnix, 2010-07-01]

1.0b2
-----

- Switch to jQuery tools 1.2.3.
  [rnix, 2010-07-01]

- Call binders with correct context.
  [rnix, 2010-05-16]

- Add overlay helper function and corresponding styles.
  [rnix, 2010-05-16]

1.0b1
-----

- Make it work.
  [rnix]

