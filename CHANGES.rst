Changelog
=========

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

