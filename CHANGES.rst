Changelog
=========

1.10 (2017-09-17)
-----------------

- Hidden form response iframe gets created on the fly and removed after form
  processing. This is necessary to prevent a useless entry in browser history.

  WARNING: This change breaks the server implementation. Take a look at
  Ajax forms documentation how to adopt your code to this change. Also make
  sure to remove the hidden iframe from bdajax markup if you don't use the
  templates shipped with this package.
  [rnix, 2017-09-12]


1.9 (2017-08-28)
----------------

- Introduce ``bdajax.register`` which should be used for registering
  binder functions instead of manipulating ``bdajax.binders`` manually.
  [rnix, 2017-07-19]

- Catch and log exceptions thrown when executing bdajax binder callback
  functions.
  [rnix, 2017-07-19]

- Use ``jQuery.on`` and ``jQuery.off`` for event binding instead of ``bind``
  and ``unbind`` (jQuery 1.7+ required).
  [rnix, 2017-07-19]

- ``bdajax.parsetarget`` includes ``query`` as string in returned object.
  [rnix, 2017-07-19]

- ``bdajax.parsepath`` accepts optional ``include_query`` boolean argument.
  [rnix, 2017-07-19]

- ``bdajax.parsequery`` accepts optional ``as_string`` boolean argument.
  [rnix, 2017-07-19]

- Consider query string in ``bdajax._handle_ajax_path`` if ``ajax:path`` is
  ``target``.
  [rnix, 2017-07-19]


1.8.1 (2017-07-18)
------------------

- Consider query string in ``bdajax._handle_ajax_path`` if ``ajax:path`` is
  ``href``.
  [rnix, 2017-07-06]


1.8 (2017-05-15)
----------------

- Add support for setting additional CSS classes to overlays.
  [rnix, 2017-05-12]


1.7.2 (2017-05-11)
------------------

- Reset ``window.location.hash`` if ``bdajax.request`` error callback gets
  unauthorized HTTP response code when redirecting to login page.
  [rnix, 2017-05-11]


1.7.1 (2017-03-29)
------------------

- Use ``bdajax`` object instead of ``this`` in ``bdajax._do_dispatching``.
  If called as callback by ``bdajax.dialog``, ``this`` is undefined.
  [rnix, 2017-03-29]


1.7 (2017-03-28)
----------------

- ``target`` option passed to ``bdajax.overlay`` is also accepted as JS object.
  [rnix, 2017-03-28]

- Handle empty target in ``bdajax.parsetarget``.
  [rnix, 2017-03-27]

- Introduce ``close`` option in ``bdajax.overlay``.
  [rnix, 2017-03-27]

- Introduce ``on_close`` callback option in ``bdajax.overlay``.
  [rnix, 2017-03-27]

- Add support for browser history navigation. Introduce ``ajax:path-target``,
  ``ajax:path-action``, ``ajax:path-event`` and ``ajax:path-overlay``
  attributes.
  [rnix, 2017-03-22]

- ``bdajax.request`` supports ``method`` in options, defaults to ``GET``.
  [rnix, 2016-10-11]


1.6.3 (2015-11-22)
------------------

- Fix ``bdajax.parseurl``.
  [rnix, 2015-11-21]


1.6.2 (2015-07-31)
------------------

- Check path starts with '/' via ``indexOf`` function instead of
  IE-unsupported ``startsWith`` function in ``bdajax.parseurl``.
  [rnix, 2015-07-29]

- Fix license in JS files.


1.6.1 (2015-06-27)
------------------

- Fix Internet Explorer 11 problem, where the pathname attribute on URL parsing
  on an "a" element doesn't start with '/'.
  [thet]


1.6.0 (2015-06-25)
------------------

- Resolve JSHint errors and warnings.
  [thet]

- Add wrapper with class ``bdajax-overlays`` around ``bdajax`` browser views.
  That way, all structures can be selected at once with Diazo.
  [thet]

- JSHint.
  [thet]

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

