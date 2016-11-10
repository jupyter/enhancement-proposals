# Jupyter Notebook Translation and Localization

## Problem

There is currently no standard approach for translating the GUI of [Jupyter notebook]( https://github.com/jupyter/notebook).
This has driven some people to do a
[single language translation for Jupyter 4.1](https://twitter.com/Mbussonn/status/685870031247400960).

For information: previous attempts and related issues:

- https://github.com/ipython/ipython/issues/6718
- https://github.com/ipython/ipython/pull/5922
- https://github.com/jupyter/notebook/issues/870

## Scope
The proposed enhancement is for "classic" [Jupyter notebook]( https://github.com/jupyter/notebook),
not [Jupyter lab](https://github.com/jupyterlab/jupyterlab).
Hopefully, some of the concepts used here will carry over, but for now the scope here is limited to classic
[Jupyter notebook]( https://github.com/jupyter/notebook).

## Proposed Enhancement

Use [Babel](http://babel.pocoo.org/en/latest/)
to extract translatable strings from the Jupyter code, creating `.pot` files that can be updated
whenever the code base changes. The `.pot` file can be thought of as the source from which all translations are derived.

Translators and/or interested contributors can then use utilities such as [Poedit](https://poedit.net/) to create
translated `.po` files from the master `.pot` file for the desired languages.

At install time, convert the translated `.po` into two runtime formats:
* Convert to `.mo` which can be used by Python code using the gettext() APIs in Python, and can also be used by
the i18n extensions in [Jinja2](http://jinja.pocoo.org/docs/dev/extensions/#i18n-extension)

* Convert to JSON using [po2json](https://github.com/mikeedwards/po2json) for consumption by the Javascript
code within Jupyter.

## Detailed Explanation

The [Jupyter notebook code]( https://github.com/jupyter/notebook) presents a significant challenge in terms of enablement for translation,
mostly because there are multiple different types of source code from which translatable UI strings
are derived.

In [Jupyter notebook]( https://github.com/jupyter/notebook), translatable strings can come from one of three places:

1. Directly from Python code

2. As part of a Jinja2 HTML template, which is consumed by Python code

3. From Javascript code

For each of these three types, it is necessary to follow a few simple steps in order to allow the code
to work properly in a translated environment.  These steps are:

1. Use an established API to identify those strings in the source code that are presented as UI
and thus should be translatable.
2. Provide the hooks in the source code that will allow the code to access translated strings
at run time.

Once these have been done, the [Babel](http://babel.pocoo.org/en/latest/) utilities provide an easy to
use mechanism to identify the files in the Jupyter code base that contain translatable strings, and
extract all of them into a single file ( a `.pot` file ) that is used as the basis for translation.

Let's look at how this would look for each of the three types mentioned above:

### Python files

Some UI strings in the Jupyter notebook come directly from Python code. For these strings, the most
widely accepted way to make them translatable is to use Python's gettext() API. When using gettext(),
the developer simply needs to enclose the translatable Python string within _(), and add the appropriate
calls in the Python to retrieve that string from the message catalog at run time. So for example:

```python
return info + "The Jupyter Notebook is running at: %s" % self.display_url
```

becomes

```python
return info + _("The Jupyter Notebook is running at: %s") % self.display_url
```

After this step is complete, then hooks must be put in place in order to tell Python to use gettext()
to retrieve the string from the message catalog at runtime. This is simply a matter of adding
```python
import gettext
```
at the top of the python code and then adding
```python
# Set up message catalog access
trans = gettext.translation('notebook', localedir=os.path.join(base_dir, 'locale'), fallback=True)
trans.install()
```

Once this is complete, any calls to `_()` in the code will retrieve a translated string from 
${base_dir}/locale/**xx**/LC_MESSAGES/notebook.mo, where **xx** is the language code in use
when the notebook is launched.
For example "de" for German, "fr" for French, etc. If no message catalog is available, or if
the string doesn't exist in the catalog, then the string passed as the argument to _() is
returned.

In this context, **${base_dir}** refers to the base installation directory for notebook. We are
assuming that all provided translations will be small enough so that they can be shipped
with notebook itself instead of having to be split out into separately installable packages.


### HTML Templates
The majority of the language of the GUI is contained in [html template files](https://github.com/jupyter/notebook/tree/master/notebook/templates) 
and accessed via [Jinja2](http://jinja.pocoo.org).

For the HTML templates, I recommend that we use the [Jinja2 i18n extension]
(http://jinja.pocoo.org/docs/dev/extensions/#i18n-extension) that allows us to specify which portions of each template contain translatable
strings, and is quite compatible with gettext() as described above.  
The extension contains some features that allow for things like variable substitution and simple plural handling,
but in it's simplest form it uses tags `{% trans %}` and `{% endtrans %}` to delimit those strings that are translatable.
Thus, the message at the top of the first screen you see when starting Jupyter looks like this in the template:

```html
<div class="dynamic-instructions">
    {% trans %}Select items to perform actions on them.{% endtrans %}
</div>
```

After properly externalizing all the strings, hooking it all up to work with [Jinja2](http://jinja.pocoo.org) is a matter of
loading the translations from the **SAME** message catalog as was defined in the Python example above, into Jinja2.
Here's an example of how that would be done within Jupyter:

```python
        env = Environment(loader=FileSystemLoader(template_path), extensions=['jinja2.ext.i18n'], **jenv_opt)
        env.install_gettext_translations(trans, newstyle=False)
```

Note here that **trans** is the same variable initialized by `gettext.translation()` in the Python example earlier.

### Javascript files

For Javascript, there are no established APIs that can consume a compiled `.mo` file directly in the same way as gettext().
However, there is a library called [Jed](https://slexaxton.github.io/Jed/) that provides an API set similar to gettext().
[Jed](https://slexaxton.github.io/Jed/) uses JSON as it's input file instead of `.mo` files, but
the good news here is that there are plenty of 3rd party utilities that can convert from `.po` into a form of JSON that
can be consumed by Jed. The author of [Jed](https://slexaxton.github.io/Jed/) recommends
[po2json](https://www.npmjs.com/package/po2json), which can be used
either as a command line utility, or directly from Javascript.  I suspect that the conversion from `.po` to either
`.mo` for Python or Jinja2, or conversion to JSON for Javascript would be something we would want to do at install time.

Identification of strings for translation using this method is done similarly to the way we would do it for Python:
by creating a function named `_()`, enclosing all translatable strings as an argument to this function, and then
binding it to the `gettext()` API.  The binding in Javascript would look like this:

```javascript
    var i18n = new Jed(nbjson);
    var _ = function (text) {
    	return i18n.gettext(text);
    }

```

Then to externalize a string, just enclose it in `_()`, for example:

```javascript
if (selectable !== undefined) {
    checkbox = $('<input/>')
        .attr('type', 'checkbox')
        .attr('title', _('Click here to rename, delete, etc.'))
        .appendTo(item);
}
```

## Use of Babel to extract translatable strings

[Babel](http://babel.pocoo.org/en/latest/) allows us to define a set of rules that define
where all the extractable strings are (whether Python, HTML template, or Javascript), what the
extraction methods are (i.e. `_()` for Python or Javascript, and `<% trans >`/`<% endtrans %>`
for the HTML templates, and do all the necessary extractions to create a single `.pot` in one
easy step.  This definition is done by creating a `babel.cfg` file, which looks something like this:

```
[python: **/**.py]
[jinja2: notebook/templates/**.html]
 encoding = utf-8
[extractors] 
 jinja2 = jinja2.ext:babel_extract
[javascript: notebook/static/tree/js/*.js]
extract_messages = $._
```

Once this is defined, message extraction can be performed using the [pybabel -extract](http://babel.pocoo.org/en/latest/cmdline.html)
command.  This should be done anytime the English source strings are modified.

## Translation Files

We haven't yet determined exactly which set of languages we plan to contribute to the project once
the enablement work is complete, but this framework should allow any other interested parties to
perform the translation and testing work at their discretion.


## Pros and Cons

Pros associated with this implementation include:
* Using established APIs such as `gettext()`, which are stable and have been around for many years.
* Message extraction can be done in such a way that a single file, or perhaps a small set of files
can be delivered to a translator.
* We don't have to have a different file format for each different technology used (Python / HTML template / Javascript )
* Much of the tooling needed has already been written, we just need to make use of it.

Cons associated with this implementation include:
* There are many external dependencies: 
[Babel](http://babel.pocoo.org/en/latest/),
[Jed](https://slexaxton.github.io/Jed/),
[po2json](https://github.com/mikeedwards/po2json).  There may be some difficulties with the licensing.
* Jupyter notebook developers have to be made aware of the proper ways to externalize any new strings
that are added, and to perform message extraction via [Babel](http://babel.pocoo.org/en/latest/)
whenever strings change.


## Prototype - Proof of Concept
I have created a **VERY** preliminary prototype of Jupyter notebook at (https://github.com/JCEmmons/notebook/tree/intl)
using the concepts presented here.  Only a handful of the strings are externalized, but there are some
from each of the 3 types, and I used [Poedit](https://poedit.net/) to create some hopefully reasonable translations
into German, Japanese, and Russian.  I haven't yet had time to add the necessary code to the Javascript
in order to do dynamic loading of the JSON, but that would be the next step.

## Interested Contributors
@twistedhardware @rgbkrk @captainsafia @JCEmmons @srl295

