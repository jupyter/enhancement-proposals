# Jupyter DeclarativeWidgets Extension Incorporation Proposal

## Problem

> "Data science enables the creation of data products." – Mike Loukides in [What is data science?](https://www.oreilly.com/ideas/what-is-data-science)

Alice is a Jupyter Notebook user. Alice has performed some data analysis in a Notebook and wants to make here results available in the form of an interactive dashboard or application. She does not want to leave the Notebook environment in order to build a rich UI for her intended audience. The UI that may require input from the user, interaction with plots, and other forms of rendering results. Currently some of solutions available for Alice are IPywidgets, Bokeh, and Plotly. These solutions suffer from the following drawbacks:

1. Most solutions are Python specific. Other language kernels has either limiting or no available solution in place.
2. Most solutions would require considerable development investment to make available on other language kernels. Their implementation rely heavily on kernel side code.
3. Most solutions are bound by a close widget system and are cumbersome to extend.
4. Layers of abstraction make debugging difficult, requiring "peeking under the hood". 

Depending on what language Alice is using for her Notebook, she will experience the following potential setbacks:

1. Her language has very limited support for plotting and widget (i.e. Scala), so she cannot complete here deliverable in the Notebook. She needs to use other tools and potentially seek help due to skill gaps.
2. A particular widget is not available. Either Alice combines other packages into the Notebook and hope they interoperate, or she hits a wall due to here gap in knowledge of web technologies.

Alice cannot simply do the following:
* Rely on a solution that is portable across different popular Data Science languages.
* Use a simple web native approach to declare widgets and connect then to the data in the kernel.
* Build interactivity through simple data bindings
* Easily tap into a growing ecosystem of web components

## Proposed Enhancement

The incubating [declarative widgets extension for Jupyter Notebook](https://github.com/jupyter-incubator/declarativewidgets) (hereafter, *declarativewidgets extension*) is the incubation projects that addresses the issues above. The community should consider incorporating the declarativewidgets extension as an official Jupyter Subproject that provides another option for building rich interactive Notebooks.

## Detailed Explanation


The declarativewidets extension focuses on enabling the user to create UI areas of the Notebook that can connect and interact with the code and data in the kernel.

In conjunction with the (dashboard extension)(https://github.com/jupyter-incubator/dashboards) and related sub-projects, it is possible to turn Notebooks into full-featured dashboards and applications.

### Current and Potential Use Cases

The declarativewidgets extension supports the following use cases:

* Invoking a function defined on the Kernel and getting the return value (if available)
* Querying the data off a DataFrame on the Kernel. The DataFrame can be a:
	* pandas
	* pyspark
	* Scala Spark
	* R
	* sparkR 
* Installing and importing a necessary web-component into the Notebook
* Creating a UI using HTML markup and connecting the elements using [Polymer's data binding)[https://www.polymer-project.org/1.0/docs/devguide/data-binding].
* Reacting to changes in data on the Kernel, for example, new data arriving on a Stream.

![taxi_declarative](https://cloud.githubusercontent.com/assets/2474841/15164018/a4e871fe-16d1-11e6-9f03-66c96b745cc4.gif)

### Current Features

The following are the most relevant features:

1. A set of declarative elements and corresponding kernel side code that enables connecting and interacting with functions, DataFrames and arbitrary data on the Kernel.
2. A set of declarative elements for visualizing data in a variety of chart types.
3. An extension to the `<template>` element that enables data bindings across multiple Notebook output cells.
4. A notebook server extension to install and importing web-components at runtime.
5. An implementation of all features for Python, R[[1]](#1), and Scala[[2]](#2) kernels.

More details and information can be found in the [documentation](https://jupyter-incubator.github.io/declarativewidgets/docs.html). The project also contains many example and demo notebooks.

### Design and Implementation

The declarativewidgets extensions is a combination of:

* A set of [web component](http://webcomponents.org/) elements and extensions built using [Polymer](https://www.polymer-project.org/1.0/)
* A frontend extension that loads the elements and dependencies
* A notebook server extension that enables installing web components using [Bower](https://bower.io/)
* Kernel side implementations for Python, R[[1]](#1), and Scala[[2]](#2)

#### Elements
##### Core elements 

* `<urth-core-function>` - Enable binding to functions defined in the kernel
* `<urth-core-dataframe>` - Access to read and query DataFrames
* `<urth-core-bind>` - Extension to the `template` tag to allow data binding across cells and with data on the kernel
* `<urth-core-import>` - Extension to the `link` tag to allow installing and importing web components

There are other `core` elements, but they play a supporting role.

Some of the `core` elements are a combination of browser and kernel component. On the browser side, these elements are built on top of the `jupyter-js-widgets` foundation. They communicate with the kernel through the Comm channel[[3]](#3).

##### Viz elements

There is a collection of `<urth-viz-*>` element that are pure client side and are use to display data. These elements include a table view and a variety of plots. 


More details about the architecture can be found [here](https://github.com/jupyter-incubator/declarativewidgets/wiki). Additionally, see the [documentation](https://jupyter-incubator.github.io/declarativewidgets/docs.html).

#### Notebook Server Extension

The extension to the notebook server creates a new route for requesting the installation of new web component. The implementation uses Bower to download the packages for the web component and servers the content from a virtual path. Bower is used because that is what Polymer [recommends](https://www.polymer-project.org/1.0/docs/tools/reusable-elements) and uses for installing components.

#### Kernel side code

The declarativewidgets extension contains code to enable support in Python, R[[1]](#1), and Scala[[2]](#2).

In Python, the code is built on to of the `ipywidgets` foundation. In the other languages, where only the code necessary exists to enable declarativewidgets, they are built directly on top of the Comm channel support.


#### Installation

The extension has maintained compatibility with:

* Notebook versions 4.0 through 4.2
* ipywidgets 4.x through 5.x
* Python 2 and Python 3

Users install it using pip and manage it via the `jupyter` command line interface.

### Criteria for Incorporation

The [Jupyter Governance - New Subproject Process](https://github.com/jupyter/governance/blob/master/newsubprojects.md) lists the criteria used to evaluate projects for incorporation in to the official Jupyter organization. We address each of these criteria below.

#### Have an active developer community that offers a sustainable model for future development.

The project has contributions from 13 developers on GitHub and has been under active development over the past 10 months. We foresee future development of the extension taking the following primary forms:

1. Fixes for reported issues
2. Compatibility updates for new versions of Jupyter Notebook (e.g., 4.3, 4.4, ...)
3. Contributed enhancements to the existing extension within the scope of the project
4. Enhancements to ease the authoring experience
5. Further work on exploring DataFrames

All items can be handled by current or future maintainers.

#### Have an active user community.

The `jupyter-incubator/declarativewidgets` repository has 55 stars and 18 watchers on GitHub. We have received questions, bug reports, and enhancement requests on GitHub and the Google Group.

#### Use solid software engineering with documentation and tests hosted with appropriate technologies.

The extension has comprehensive suite of unit tests. These include unit tests for all supported languages, plus a unit tests for the web code. It also has a suite of system tests that use Selenium to drive the Notebook UI validate key features. These tests are run on a matrix that includes different versions of Python, Jupyter, ipywidgets and kernel languages.

The project used Travis CI. All PRs are validated against a single browser vendor. On a PR merge, all tests are ran using SauceLabs on a variety of browser vendors.

Deployment of releases to Pypi is automated using Git tags and Travis CI.

Installation documentation is available in the README. Usage and API documentation is available off the [project site](https://jupyter-incubator.github.io/declarativewidgets/) or embedded in the Notebook using the `urth-help` element. Architectural details are available in the [project's wiki](https://github.com/jupyter-incubator/declarativewidgets/wiki).

#### Demonstrate continued growth and development.

See "Have an active developer community that offers a sustainable model for future development."

#### Integrate well with other official Subprojects.

The declarative extensions have several examples of interoperation with `ipywidgets`. It also includes a dedicate element (`urth-core-ipywidget`) that can embed an ipywidget within a declarative template.

#### Be developed according to the Jupyter governance and contribution model.

The declarativewidgets extension is in the Jupyter Incubator, and under the Jupyter governance and contribution model since its inception.

#### Have a well-defined scope.

The purpose of the declarativewidgets extension is to provide a language neutral approach to creating interactive notebooks. It is not the intention of this project to become a widget suite, but rather, to enable incorporating any web-component into a notebook and connecting it to the code and data in the kernel.

#### Be packaged using appropriate technologies such as pip, conda, npm, bower, docker, etc.

The declarativewidgets extension is packaged using setuptools, released on PyPI, and installable using `pip`. Users manage the extension after `pip install` via the `jupyter` CLI.

## Pros and Cons

* Pro: Enable a language neutral approach to defining the interactive areas of the notebook.
* Pro: Supports a variety of kernel language and in doing so, demonstrated the relative ease of enabling more languages.
* Pro: Leverage the ecosystem of web components. Need a widget? Search for it, don't write it.
* Con: HTML can be verbose
* Con: HTML authoring is not a strong feature of Jupyter Notebooks. Using the `%%html` magic is not an ideal experience

## Interested Contributors

@lbustelo

---
<a name="1"></a> [1] R support though [IRkernel](https://github.com/IRkernel/IRkernel)

<a name="2"></a> [2] Scala support is only available for [Apache Toree](https://toree.incubator.apache.org/)

<a name="3"></a> [3] As part of enabling R support, [contributions](https://github.com/IRkernel/IRkernel/pull/272) were made to IRkernel to add Comm channel support.
