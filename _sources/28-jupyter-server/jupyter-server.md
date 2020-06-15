---
title: Standalone Jupyter server
authors: Zach Sailer ([@Zsailer](https://github.com/Zsailer)) and Sylvain Corlay ([@SylvainCorlay](https://github.com/sylvaincorlay))
issue-number: 31
pr-number: 28
date-started: "2016-09-20"
type: S - [Standards Track](https://www.python.org/dev/peps/#pep-types-key)
---

# Standalone Jupyter server enhancement

## Problem

There are now multiple frontends that talk to the backend services provided by the notebook server: the classic Notebook, the dashboards, nteract, JupyterLab, standalone widgets and more. The configuration of classic notebook and the backend server are tightly coupled. As a consequence, the other applications are forced to load the legacy notebook to use the backend server.

## Proposed Enhancement

Decouple the backend server (and its configuration) from the classic notebook frontend. This will require the following steps:

1. [Separate `jupyter_server` repository](#separate-jupyter_server-repository)
    - A fork of the `notebook` repository.
    - Pure Python package with notebook backend services.
    - `notebook` tornado handlers and frontend logic stay in `notebook` repo.
    - Deprecated notebook server APIs do not move to `jupyter_server`.
1. [Clearly define the smallest unit that is a "Jupyter Server"](#clearly-define-the-smallest-unit-that-is-a-jupyter-server)
    - Kernel, KernelSpecs, and Session (?) become the only core services
    - Everything else becomes a server extension?
1. [Extensions as Applications](#extensions-as-applications)
    - server extensions move to `jupyter_server`.
    - New `ExtensionApp` class
    - Notebook, jupyterlab, etc. become ExtensionApps.
1. [New server extensions mechanism.](#new-server-extensions-mechanism)
    - new base classes to create applications from server extensions.
    - nbextensions stay in `notebook`.
    - `jupyter_notebook_config.d` folder becomes `jupyter_server_config.d`
1. [Namespacing static files and REST API urls.](#add-namespacing-to-static-endpoints-and-rest-api-urls)
    - Each extension serves static files at the `/static/<extension>` url.
    - New `ExtensionHandlerApp` class
1. [Configuration System](#configuration-system)
1. [Migrate application.](#migration-application)

## Detailed Explanation

### Separate `jupyter_server` repository

The first thing to do is fork `notebook`. A new `jupyter_server` repo will keep the server specific logic and remove:
1. the notebook frontend code,
2. deprecated notebook server APIs, and
3. tornado handlers to the classic notebook interface. These pieces will stay in the `notebook` repository.

Modules that stay in notebook:
- `edit` module: the handlers for the classic notebook text editor.
- `templates` directory: all html templates for the classic notebook
- `terminal` module: handlers for the classic notebook terminal application.
- `view` module: handlers for file viewer component.
- `static` directory: all js and style sheets for notebook frontend.
- `tree` module: a classic notebook file browser+handlers.

Modules that move to jupyter_server:
- `services` module: all jupyter server services, managers, and handlers
- `bundler`: handlers for building download bundles
- `files`: handlers for serving files from contents manager.
- `kernelspec`: handler for getting kernelspec
- `base`: base handler for jupyter apps.
- `i18n`: module for internationalizing the jupyter server
- `auth` module

Preliminary work resides in [jupyter_server](https://github.com/jupyter/jupyter_server).

### Clearly define the smallest unit that is a "Jupyter Server"

*(This section needs a lot more discussion.)*

The server-notebook split is an opportunity to clearly define Jupyter's core services. The old notebook server was comprised of many services, and it could be extended by separate "server extensions". However, it isn't clear what should be a core service versus a server extension. Some extensions were "grand-fathered" in as core services to make the notebook application more full-featured (e.g. nbconvert, terminals, contents, ...). Now that we are separating the server from the classic notebook, we need to reevaluate what services are core to the Jupyter Server.

Jupyter server aims to be a core building block for other applications (like nteract, lab, dashboards, standalone widgets, etc.). To achieve this, we need to define the simplest "unit" that defines a Jupyter Server: `kernels`, `kernelspec`, and `sessions`. Other services become extensions to the core server (using the `load_jupyter_server_extension` mechanism defined below).

### Extensions as Applications

A new `ExtensionApp` class will be available in `jupyter_server.extensions.extensionapp`. It enables developers to make server extensions behave like standalone Jupyter applications. Jupyterlab is an example of this kind of server extension. It can be configured, initialized, and launched from the command line. When Lab is launched, it first initializes and configures a jupyter (notebook) server, then loads the configured jupyterlab extension and redirects the use to the Lab landing page.

`ExtensionApp` handles the boilerplate code to make Jupyter applications that configure and launch server extensions directly. It inherits `jupyter_core.JupyterApp` and exposes a command line entry point: `jupyter <extension-name>`. When an extension is launched, it first configures and starts a jupyter_server (`ServerApp`); then, it loads the configured extension and redirects users to the extension's landing page. Extension developers simply inherit the `ExtensionApp` and add the extension's `load_jupyter_server_extension` as a `staticmethod`.

```python
from jupyter_server.extensionapp import ExtensionApp
from .extension import load_jupyter_server_extension

class MyExtension(ExtensionApp):

    name = 'myextension'
    description = 'My server extension as a Jupyter app.'
    load_jupyter_server_extension = staticmethod(load_jupyter_server_extension)
```

`ExtensionApp`s can be configured by `jupyter_<extension-name>_config.py|json` as well. When the server extension is loaded by a server or launched from the command line, it searches the list of `jupyter --paths` for configured traits in these files.

Initial experimental work resides in [`jupyter_server_extension`](https://github.com/Zsailer/jupyter_server_extension).

**Classic notebook server extension**

The classic `NotebookApp` will become a server extension. It will inherit `ExtensionApp`. Users can enable the notebook using the extension install/enable mechanism or enable the `notebook` in their `jupyter_server_config.py` file:
```python
c.ServerApp.jpserver_extensions = {
    'notebook': True
}
```
Users can also launch the notebook application using the (usual)`jupyter notebook` command line interface.

### New server extensions mechanism.

The new extension mechanism in the *jupyter server* will differ from notebook's server extensions.

* The `--sys-prefix` installation would become the default. (Users are confused when enabling an extension requires more permissions than the installation of the package). Installation in system-wide directories would be done with the `--system` option.
* Installing an extension will include the addition of a 'manifest' file into a conf.d directory (under one of the Jupyter configuration directories, `user / sys-prefix / system`). The placement of such an extension manifest provided by a Python package can be done with `jupyter server extension install --py packagename [--user / --system / --sys-prefix]`. Packages (conda or wheels) carrying server extensions could place such manifests in the sys-prefix path by default effectively installing them. Development installations would also require the call to the installation command.

* Enabling an extension is separate from the installation. Multiple scenarios are possible:
  - enabling an extension at the same level (user / sys-prefix / system) as where it was installed, or at a higher level (user for sys-prefix and system, or sys-prefix for system).
  - forcibly disabling an extension that was enabled at a lower level of precedence.
  - forcibly enabling an extension that was disabled at a lower level of precedence.
  This would be done via two `conf.d` configuration directories managing a list of disabled extensions and list of enabled extensions in the form of empty files having the name of the corresponding extension. If an extension is both disabled and enabled at the same level of precedence, disabling has precedence. Packages (conda or wheels) could place such a enabler file in the sys-prefix path by default. The `jupyter server extension enable` command would be required for development installations.

(Possibly) when an extension is enabled at a given precedence level, it may only look for the version of the extension installed at the same or lower precedence level. For example, if an extension `foobar` is installed and enabled system wide, but a user installs a version with `--user`, this version will only be picked up if the user also enables it with `--user`.

### Add namespacing to `static` endpoints and REST API urls.

Currently, the notebook tornado application serves all static files underneath the `/static/` prefix. Jupyter server will add namespacing under the static url and extension REST API urls. Each extension will serve their static files under the `/static/<extension-name>` prefix and their API handlers behind a `/extension/api/<extension-name>` prefix.

For example, the classic notebook server extension will add static handlers that reroute requests to the `/static/notebook/` endpoints.

A new `ExtensionHandler` class will be available in `jupyter_server.extensions.handlers`. This class inherits `JupyterHandler`. It handles the boilerplate code to reroute requests extension's namespaced static and REST API endpoints.

Preliminary experimental work resides in the [`jupyter_server_extension`](https://github.com/Zsailer/jupyter_server_extension) repository.

### Configuration System

Splitting the server-specific pieces from the classic notebook affects Jupyter's configuration system. This is a non-trivial problem. Changing Jupyter's configuration system affects everyone. We need to consider how to make this transition as painless as possible. At the end of this section, we list some steps that make reduce the friction.

Here is a list of things the changes on the configuration system:
* Move server-specific configuration from `jupyter_notebook_config.py|json` into `jupyter_server_config.py|json`.
* Notebook configuration will stay in `jupyter_notebook_config.py|json`.
* Server extensions configurations move from `jupyter_notebok_config.d` to `jupyter_server_config.d`.
* The tornado server and webapp configurable applications move to `jupyter_server`. They become `ServerApplication` and `ServerWebApp`
* The `NotebookApp` becomes a server extension. It would only load notebook specific configuration/traitlets, from `jupyter_notebook_config.py|json`.
* Server extensions are found using the `jpserver_extensions` trait instead of the `nbserver_extensions` trait in the `ServerApp`.
* Extension configuration files in `jupyter_server_config.d` must be enabled using the `jpserver_extensions` trait. They are enabled by JSON config files in `jupyter_server_config.d`.
* Extensions can create their own configuration files in `{sys-prefix}/etc/jupyter/` or `~/.jupyter`, i.e. `jupyter_<my-extension>_config.py|json`.
* General `jupyter_config.py|json` files must update to set server-specific configuration using the `ServerApp` and notebook specific configuration using `NotebookApp`.

Some traits will stay in `jupyter_notebook_config.py|json`. Here is a list of those traits (everything else moves to server config files):
* extra_nbextensions_path
* enable_mathjax
* max_body_size
* max_buffer_size
* notebook_dir
* mathjax_url
* get_secure_cookie_kwargs
* mathjax_config
* ignore_minified_js

Here are some steps we can take to reduce the friction for transitioning:
* **Copy (not move)** `jupyter_notebook_config.py|json` to `jupyter_server_config.py|json`
* **Copy (not move)** `jupyter_notebook_config.d/` to `jupyter_server_config.d`.
* `NotebookApp` becomes `ServerApp` in all copied files.
* Leftover server traits in `jupyter_notebook_config.py|json` get ignored when the notebook extension is initialized. Server traits are only read from `jupyter_server_config.py|json`.
* Document like crazy!

For an thorough overview of the configuration system and a side-by-side diff between the (current) notebook and (future) server config layout, take a look at [Zsailer/jupyter_config_overview](https://github.com/Zsailer/jupyter_config_overview).

### Migration application

To make migration easier on users, a `migrate` application will be available to split notebook and server configurations into their appropriate locations (listed above).

### How this effects other projects

**Classic notebook**
In short, the classic notebook will become a server extension application. The rest of this proposal describes the details behind what will change in the notebook repo.

`JupyterServerExtensionApp`

**Jupyter Lab**
Jupyter lab will also become a server extension application. The new classes described above should simplify the way JupyterLab interfaces with the server.

**Kernel Gateway**
Kernel Gateway can use the new Jupyter Server to server kernels as a service. The new Jupyter server will remove the unwanted services that Kernel Gateway currently removes by using a custom server application. KG will also be able to swap out the kernels and kernelspec manager in the Jupyter Server with its custom classes.

**Kernel Nanny**

## Pros and Cons

**Pros** associated with this implementation include

* Allow various frontends to use the backend services of the jupyter server.
* Provides base classes for extension developers writing server extension applications and handlers.
* Reduce complexity when extending the server by making everything a server extension.
* Organizes the configuration for server and extension in a sane and logical manner (`conf.d` approach).

**Cons** associated with this implementation include:

* Break the classic notebook in a backwards incompatible way.
* Affects many projects. The transition may be painful?
* Adding a dependency injection system adds new complexity.

## Relevent Issues, PRs, and discussion

Jupyter's configuration system.
* PR [3116](https://github.com/jupyter/notebook/pull/3116), `jupyter/notebook`: extension config in `config.d` directory.
* PR [3782](https://github.com/jupyter/notebook/issues/3782), `jupyter/notebook`: server extension use `conf.d` approach
* PR [2063](https://github.com/jupyter/notebook/issues/2063), `jupyter/notebook`: config merging problems.
* [Overview](https://github.com/Zsailer/jupyter_config_overview) of Jupyter's configuration system

Conversation on server/notebook extensions:
* PR [1706](https://github.com/jupyter/notebook/issues/1706), `jupyter/notebook`: proposal to improve server/notebook extensions
* PR [2824](https://github.com/jupyter/notebook/issues/2824), `jupyter/notebook`: enable nbextensions by default

Static Namespace:
* PR [21](https://github.com/jupyter/enhancement-proposals/pull/21#issuecomment-248647152)`jupyter/enhancement-proposals`: mention namespacing.

## Interested

@Zsailer, @SylvainCorlay, @ellisonbg, @blink1073, @kevin-bates
