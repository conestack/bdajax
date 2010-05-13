bdajax
======

AJAX convenience.

This package bundles required resources for the use of bdajax inside a ``bfg``
or ``zope`` application. It does NOT include the required server
implementations.

bdajax provides some JavaScript helper functions and a simple dispatcher system 
which is driven by attributes. These attributes are defined in a XML namespace 
extension, placed in your XHTML markup.

You can basically control 3 behaviors with the supported attributes:

    - Call functions

    - Trigger events
    
    - Perform actions

Each behavior is bound to a JavaScript event itself. 


Dispatching
-----------

For those who know KSS (Kinetic Style Sheets) and TAL (Tag Attribute Language);
The syntax reminds of TAL - attributes are interpreted by JS instead of a TAL
interpreter - while the functionality is inspired by KSS.

The main paradigm and at the same time the main difference to KSS is the use
of an ``event/listener`` model, what makes it possible to ``listen`` to, and
trigger ``events`` on ajaxified DOM components.

Consider a navtree as example; the idea is to trigger an event when a navigation
item gets clicked, and listen to this event on all DOM elements which wants to
get notified if server context changes (what is indicated by the thrown event).

This makes it possible to have completely decoupled "sub-applications" knowing
nothing but an event contract from each other.


Attributes
----------

You can define the following attributes in your markup:

  - ajax:bind="evt1 evt2"
        Indicate bdajax behavior on DOM element and the event(s) triggering
        it/them.

  - ajax:call="function1:selector1 function2:selector2"
        Call function(s). The function gets passed a jQuery iterator of
        selector and a target object. Target object provides ``url`` and
        ``params``.

  - ajax:event="evt1:sel1 evt2:sel2"
        Trigger event(s) on selector. The triggered event gets the target
        as additional parameter on event.ajaxtarget.
  
  - ajax:action="name1:selector1:mode1 name2:selector2:mode2"
        Perform AJAX action(s) on selector with mode. selector points the target
        DOM element while mode defines how to modify the DOM tree. Possible
        mode values are ``inner`` and ``replace``.
  
  - ajax:target="http://fubar.org?param=value"
        AJAX target definition. Consists out of target context URL and a
        query string used for requests on the target context.
        ``ajax:target`` is mandatory when ``ajax:event`` is defined, and
        optional when ``ajax:action`` is defined (depends if event is triggered
        by bdajax or browser event). See below to get a clue what i am
        talking about.


Provide dependencies on server
------------------------------

This package already includes resource configuration for ``Zope`` and ``bfg``.
This is done due to ZCML. Please include one of the following ZCML include
statements depending on your platform.
::

    <include package="bdajax" file="bfg.zcml" />

for use in bfg, and
::
    
    <include package="bdajax" file="zope.zcml" />

for use in Zope.

The expected ``ajacaction`` view is not provided. Thats intended to be a custom
implementation. See 'Perform actions' below.


Load dependencies in markup
---------------------------

You have to load dependent JavaScripts and CSS in HTML header 
::

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script> 
    <script src="http://cdn.jquerytools.org/1.1.2/tiny/jquery.tools.min.js"></script>
    <script src="http://fubar.com/++resource++bdajax/bdajax.js"></script>
    <link href="http://fubar.com/++resource++bdajax/bdajax.css"
          rel="stylesheet" type="text/css" media="screen" />

You have to make sure that the contents of ``bdajax.pt`` are rendered in your
markup as well.


Define namespace
----------------

In order to keep your XHTML valid when using the XML namespace extension you
have to define this namespace in your XHTML document
::

    <html xmlns="http://www.w3.org/1999/xhtml"
          xmlns:ajax="http://namesspaces.bluedynamics.eu/ajax">
        ...
    </html>


Event binding
-------------

Indicate bdajax behavior on DOM element
::

    <a href="http://fubar.com"
       ajax:bind="keydown click">
      fubar
    </a>

Binds this element to events ``keydown`` and ``click``.


Calling functions
-----------------

Provide the function to be called in your JavaScript
::

    somefunc = function(iter, target) {
        // do something
    }

Bind call behavior to DOM element
::

    <a href="http://fubar.com"
       ajax:bind="click"
       ajax:call="somefunc:.someclass"
       ajax:target="http://fubar.com">
      fubar
    </a>

When the link gets clicked, ``somefunction`` is called which gets passed an
iterator, in this case jQuery('.someclass'), and a target object,
containing ``url`` and ``params`` if ``ajax:target`` is set.


Trigger events
--------------

Bind event behavior to DOM element
::

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


Perform actions
---------------

An action performs a JSON request to the server and modifies the DOM tree as
defined.

bjadax expects a view named ``ajaxaction`` on server. This view gets called on
target url with target query parameters. 3 additional arguments are passed:

    - bdajax.action - the name of the action
    
    - bdajax.selector - the selector must be added to response
    
    - bdajax.mode - the manipulation mode. Either ``inner`` or ``replace``

The view is responsible for rendering the requested resource and return a JSON
response in this format:
::

    {
        mode: 'inner',            // the passed mode
        selector: '#someid',      // the passed selector
        payload: '<div>...</div>' // the rendered action
    }

Bind an action which gets triggered directly
::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:action="renderfubar:.#fubar:replace"
       ajax:target="http://fubar.com/baz?a=a">
      fubar
    </a>

When this link is clicked, the DOM element with id ``fubar`` gets replaced with
results of action ``renderfubar``. Request context and request params are taken
from ``ajax:target`` definition.

Bind an action which acts as event listener. Consider section 'Trigger events'.
The event triggered there indicates that context has changed to target
with params. Now we want to react on this and perform some action
::

    <div id="content"
         class="contextsensitiv"
         ajax:bind="contextchanged"
         ajax:action="rendercontent:#content:inner">
      ...
    </div>

Note, if you bind actions as event listeners, there's no need to define a target
since it is passed along with the event.


Multiple behaviors
------------------

Bind multiple behaviors to one DOM element
::

    <a href="http://fubar.com/baz?a=a"
       ajax:bind="click"
       ajax:call="somefunc:.someclass"
       ajax:event="contextchanged:.contextsensitiv"
       ajax:action="rendersomething:.#something:replace"
       ajax:target="http://fubar.com/baz?a=a">
      fubar
    </a>

In this example, when the link gets clicked, function ``somefunc`` is called,
event ``contextchanged`` is triggered and action ``rendersomething`` is
performed.


JavaScript helpers
==================

Messages, Infos, Warnings and Errors
------------------------------------

``bdajax`` provides displaying application messages in a jQuery tools
overlay. ``bdajax.message`` displays a message as is, while ``bdajax.info``,
``bda.warning`` and ``bda.error`` decorates the message with the appropriate
icon.
::

    bdajax.message('I am an application Message');


URL Operations
--------------

You can parse hyperlinks for base URL or request parameters
::

    bdajax.parseurl('http://fubar.org?param=value');

results in
::

    'http://fubar.org'

while
::

    bdajax.parsequery('http://fubar.org?param=value');

results in
::

    { param: 'value' }

You can do both at once by calling ``parsetarget``
::

    bdajax.parsetarget('http://fubar.org?param=value');

This result in
::

    {
        url: 'http://fubar.org',
        params: { param: 'value' }
    }


XMLHTTPRequest convenience
--------------------------

``bdajax`` provides the function ``request`` as convenience for
XMLHTTPRequests. By default it sends requests of type ``html`` and displays
a ``bdajax.error`` message if request fails.
::

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

Given ``url`` might contain a query string. The query gets parsed and
written to request parameters. If same request parameter is defined
in URL query AND params object, latter one rules.

Options
::

    ``success`` - Callback if request is successful.
    
    ``url`` - Request url as string.
    
    ``params`` - Query parameters for request as Object (optional). 
    
    ``type`` - ``xml``, ``json``, ``script``, or ``html`` (optional).
    
    ``error`` - Callback if request fails (optional).


Perform action manually
-----------------------

Sometimes you want to perform actions manually. Use ``bdajax.action`` for
this.
::

    var target = bdajax.parsetarget('http://fubar.org?param=value');
    bdajax.action({
        name: 'content',
        selector: '#content',
        mode: 'inner',
        url: target.url,
        params: target.params
    });

Options
::

    ``name`` - Action name
    
    ``selector`` - result selector
    
    ``mode`` - action mode
    
    ``url`` - target url
    
    ``params`` - query params


Trigger events manually
-----------------------

Sometimes you want to trigger an event manually. Since bdajax expects the
attribute ``ajaxtarget`` on the received event we provide a convenience.
::

    var url = 'http://fubar.org?param=value';
    bdajax.trigger('contextchanged', '.contextsensitiv', url)


3rd Party Javascript
--------------------

When writing applications, you might have your own set of custom javascrips
where some actions has to be bound in your markup. Therefor the object
``binders`` exist on ``bdajax``. Just hook your binding callback to this
object and it will be called every time bdajax hooks some markup.
::

    mybinder = function (context) {
        jQuery('mysel').bind('click', function() { ... });
    }
    bdajax.binders.mybinder = mybinder;


Browsers
========

bdajax is tested in:

    - Firefox 3.5
    
    - IE 7
    
    - to be continued... 

 
Credits
=======

    - Robert Niederreiter <rnix@squarewave.at>


Changes
=======

1.0b1
-----

    - make it work [rnix]