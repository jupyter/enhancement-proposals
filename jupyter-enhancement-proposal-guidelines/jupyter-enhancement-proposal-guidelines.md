# Jupyter Notebook Translation and Localization

## Problem

There is currently no standard approach for translating the GUI of Jupyter notebook. This has driven some people to do a [single language translation for Jupyter 4.1](https://twitter.com/Mbussonn/status/685870031247400960).

## Proposed Enhancement

Use Tornado [translation capabilities](http://www.tornadoweb.org/en/stable/locale.html) to translate the GUI's templates. This will cover translating the words and sentences in the GUI and localized styles (like Right to left languages).

## Detail Explanation

The language of the GUI is mostly hard coded in [html template files](https://github.com/jupyter/notebook/tree/master/notebook/templates) with some exceptions where some language is written in [javascript files](https://github.com/jupyter/notebook/blob/master/notebook/static/notebook/js/about.js#L12) and even a few words in [python code](https://github.com/jupyter/notebook/blob/4578c34b0f999735ee49e1492be3dd5941951551/notebook/base/handlers.py#L332).

### HTML Templates

Tornado [exposes](http://www.tornadoweb.org/en/stable/guide/templates.html#template-syntax) its `translate()` function to template rendering using `_` as a shorthand (which is common in other libraries web frameworks like Django). This is an example of how to translate the [menu of a notebook](https://github.com/jupyter/notebook/blob/4.x/notebook/templates/notebook.html#L80):

```HTML
<a href="#">New Notebook</a>
```

This will be done like this:

```HTML
<a href="#">{{ _("New Notebook") }}</a>
```

### Javascrip files

Regarding Javascript we will use the same approach as HTML but we will have to do a few more changes to make sure javascript files get translated before they are sent to the browser. The approach for this is as follows:

1. Subclass `web.StaticFileHandler` and call it `JupyterStaticFileHandler`
2. Overide `get()` function to make it render static files if they end with .js
3. Use `JupyterStaticFileHandler` instead of the `web.StaticFileHandler` in the RequestHander for static files.

To demonstrate translation in a [jacascript file](https://github.com/jupyter/notebook/blob/4.x/notebook/static/notebook/js/about.js#L12), we will use the following:

```javascript
var text = 'You are using Jupyter notebook.<br/><br/>';
```

Will be done like this

```javascript
var text = "{{ _('You are using Jupyter notebook.<br/><br/>') }}";
```

### Python files

We can use `translate(message, plural_message=None, count=None)` (or it's shorthand `_`) in Tornado RequestHandler or anywhere else where text it sent to the GUI.

To demonstrate this I'll be using [existing text in python](https://github.com/jupyter/notebook/blob/4578c34b0f999735ee49e1492be3dd5941951551/notebook/base/handlers.py#L332) that needs translation:

```python
raise web.HTTPError(400, u'Invalid JSON in body of request')
```

This will be done like this:

```python
raise web.HTTPError(400, _(u'Invalid JSON in body of request'))
```

## Translation Files

All languages will be treated as translations including English. All translation files will be located inside the extensions folder and will be treated as extensions. This will allow Jupyter to be shipped with one translation (English) and allows people to get other translations as an nb-extension.

The files will be .po (Portable Object) files for each language and they will be compiled to .mo (Machine Object) files to work with xgettext which is supported by the `translate()` function in Tornado.

The original PO file can be created using [xgettext](http://www.gnu.org/software/gettext/manual/gettext.html#xgettext-Invocation):

```bash
xgettext [option] [inputfile]
```

For the translation, we can use a text edit for the PO files. But I would recommend using a crowd-sourced solution where people can translate words or sentences on a web application like [POEdit](https://poeditor.com/features/)

## Which translation to use?

The default configuration file can be used to add a new configuration variable for the default language.

c.gui_language = 'en_US'

We can also set it to "auto" if we want to use Tornado to detect the end-user language which is provided in `Accept-Language` header. Tornado can find the best match for the end-user language or return the default language if it doesn't have that translation.

## Pros and Cons

Pros associated with this implementation include:
* No extra dependencies
* Using a well known standard that can be extended for any number of languages
* Can be used later with Jupyter Hub to set multiple languages for multi-lingual teams.

Cons associated with this implementation include:
* Javascrip strings and HTML files will have `{{ _(XXX) }}` in the source code.
* A change in the development guide lines to use translation

## Interested Contributors
@twistedhardware @rgbkrk
