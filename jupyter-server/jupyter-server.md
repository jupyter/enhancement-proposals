# Standalone Jupyter server enhancement proposal [active]

## Problem

There are now multiple frontends that talk to the backend services provided by the notebook server: the legacy Notebook, the dashboards, JupyterLab, standalone widgets and more. The configuration of legacy notebook and the backend server are tightly coupled. As a consequence, the other applications are forced to load the legacy notebook to use the backend server.

## Proposed Enhancement

Decouple the backend server (and its configuration) from the classic notebook frontend. This will require the following steps:

1. Create `jupyter_server` repository
    - Fork of `notebook` repository. 
    - Pure Python package with notebook backend services.
    - `notebook` tornado handlers and frontend logic stay in `notebook` repo.
    - Deprecated notebook server APIs do not move to `jupyter_server`.
2. New server extensions mechanism.
    - server extensions move to `jupyter_server`.
    - new base classes to create applications from server extensions. 
    - nbextensions stay in `notebook`. 
    - `jupyter_notebook_config.d` folder becomes `jupyter_server_config.d`
    - `notebook` becomes a server extension.
3. Services become server extensions
    - Services are just serve extensions with dependencies.
    - Add dependency injection system.
5. Namespacing static files and REST API urls. 
    - Each extension serves static files at the `/static/<extension>` url.
    - 
6. Migrate configuration.
    - Notebook App configuration stays in `jupyter_notebook_config.py`
    - Server and services configurations move to `jupyter_server_config.py`
    - Add a `migrate` application to automate this migration.
7. Add necessary documentation to notebook and jupyter_server repos.

## Detailed Explanation

### Create a `jupyter_server` repository

The first thing to do is fork `notebook`. A new `jupyter_server` repo will keep the server specific logic and remove:
1. the notebook frontend code, 
2. deprecated notebook server APIs, and
3. tornado handlers to the classic notebook interface. These pieces will stay in the `notebook` repository.

Things that stay in notebook:

- `edit` module: the handlers for the classic notebook text editor.
- `templates` directory: all html templates for the classic notebook
- `terminal` module: handlers for the classic notebook terminal application.
- `view` module: handlers for file viewer component.
- `static` directory: all js and style sheets for notebook frontend.
- `tree` module: a classic notebook file browser+handlers.
- `auth` module? *(Should this move to jupyter_server?)*

Things that move to jupyter_server:
- `services` module: all jupyter server services, managers, and handlers
- `bundler`: handlers for building download bundles
- `files`: handlers for serving files from contents manager.
- `kernelspec`: handler for getting kernelspec
- `base`: base handler for jupyter apps.
- `i18n`: module for internationalizing the jupyter server


Preliminary work resides in [jupyter_server](https://github.com/jupyter/jupyter_server).

### Server Extensions

The extension mechanism for the *jupyter server* will be the main area where server extensions differ from notebook's server extensions.

Enabled server extensions will still be loaded using the `load_jupyter_server_extension` approach when the jupyter server is started. 

**Server extensions as applications**

In the proposed jupyter_server, extension developers may also create an application from their extension, using a new `JupyterServerExtensionApp` class. Extension developers can subclass the new base class to make server extensions into Jupyter applications (configurable and launchable from the commmand line). This new class loads extension config from file and parses configuration set from the command line. 

For example, the legacy notebook could be started: 1) as an enabled extension or 2) by running the traitlets application from the command line.

Example extension:
```python
from .extension import load_jupyter_server_extension

class NotebookApp(JupyterServerExtensionApp):

    name = 'notebook'
    description = 'NotebookApp as a server extension.'
    load_jupyter_server_extension = staticmethod(load_jupyter_server_extension)
```

`JupyterServerExtensionApp` subclasses are configurable using Jupyter's configuration system. Users can generate config files for each extension in the Jupyter config path (see `jupyter --paths`). Each extension's configuration is loaded when the server is initialized or the extension application is launched.

As will all jupyter applications, users can autogenerate a configuration file for their extension using `jupyter my_extension --generate-config`.

Initial experimental work resides in [`jupyter_server_extension`](https://github.com/Zsailer/jupyter_server_extension).

**Classic notebook server extension**

The classic `NotebookApp` will become a server extension. It will inherit `JupyterServerExtensionApp`. Users can enable the notebook using the extension install/enable mechanism or enable the `notebook` in their `jupyter_server_config.py` file:
```python
c.ServerApp.jpserver_extensions = {
    'notebook': True
}
```
Users can also launch the notebook application using the (usual)`jupyter notebook` command line interface. 

**Extension installing/enabling mechanism**

The new extension mechanism in the *jupyter server* will differ from notebook's server extensions.

* The `--sys-prefix` installation would become the default. (Users are confused when enabling an extension requires more permissions than the installation of the package). Installation in system-wide directories would be done with the `--system` option. 
* Installing an extension will include the addition of a 'manifest' file into a conf.d directory (under one of the Jupyter configuration directories, `user / sys-prefix / system`). The placement of such an extension manifest provided by a Python package can be done with `jupyter server extension install --py packagename [--user / --system / --sys-prefix]`. Packages (conda or wheels) carrying server extensions could place such manifests in the sys-prefix path by default effectively installing them. Development installations would also require the call to the installation command.

* Enabling an extension is separate from the installation. Multiple scenarios are possible:
  - enabling an extension at the same level (user / sys-prefix / system) as where it was installed, or at a higher level (user for sys-prefix and system, or sys-prefix for system).
  - forcibly disabling an extension that was enabled at a lower level of precedence.
  - forcibly enabling an extension that was disabled at a lower level of precedence.
  This would be done via two `conf.d` configuration directories managing a list of disabled extensions and list of enabled extensions in the form of empty files having the name of the corresponding extension. If an extension is both disabled and enabled at the same level of precedence, disabling has precedence. Packages (conda or wheels) could place such a enabler file in the sys-prefix path by default. The `jupyter server extension enable` command would be required for development installations.
  
(Possibly) when an extension is enabled at a given precedence level, it may only look for the version of the extension installed at the same or lower precedence level. For example, if an extension `foobar` is installed and enabled system wide, but a user installs a version with `--user`, this version will only be picked up if the user also enables it with `--user`.

### Services become server extensions (with dependency injection)

Right now, there are two ways to extend and customize the jupyter server: services and server extensions. This is a bit confusing for new contributors. The main difference is that services often (but not always) **depend on other services**. 

On example is the `sessions` service, which depends on the `kernels` and `kernelspec` services. Without these two services, the `sessions` service doesn't work (or even make sense). 

We could reduce complexity around `jupyter_server` by making *everything* a server extension. We would need to add a **dependency injection** system to allow extensions to depend on other extensions. Some good options are [pyinject](https://github.com/google/pinject) or [python-dependency-injector](https://github.com/ets-labs/python-dependency-injector).

To port a service, it will need to be refactored using extension mechanism mentioned above.

### Add namespacing to `static` endpoints and REST API urls.

Currently, the notebook tornado application serves all static files underneath the `/static/` prefix. Jupyter server will add namespacing under the static url and extension REST API urls. Each extension will serve their static files under the `/static/<extension-name>` prefix and their API handlers behind a `/extension/api/<extension-name>` prefix.

For example, the classic notebook server extension will add static handlers that reroute requests to the `/static/notebook/` endpoints.

The jupyter_server will provide a new `JupyterExtensionHandler` base class that reroute requests to the extension's namespaced static and REST API endpoints.

Preliminary experimental work resides in the [`jupyter_server_extension`](https://github.com/Zsailer/jupyter_server_extension) repository.

### Configuration System

The configuration of the server and the legacy notebook are currently tightly coupled in a single NotebookApp configurable. The proposed jupyter server has server-specific configurations in a separate config system from the classic notebook (and jupyterlab) application configurations.

The table below show all the classic notebook traits and where they will live after migration.

**Overview of configuration structure**

The notebook and server configuration both live in the `jupyter_notebook_config.py` file. Extensions are configured in separate files (named after the extension) in the `jupyter_notebook_config.d` directory:
```
~/.jupyter/
├── jupyter_notebook_config.py
└── jupyter_notebook_config.d
   └── my_extension.json
```

**New proposed configuration structure**

The jupyter_server configuration lives in the `jupyter_server_config.py` file. Extensios are configured in separate files in the `jupyter_server_config.d` folder. The notebook configuration is stored in a `notebook.py` file, just like other extensions.
```
~/.jupyter/
├── jupyter_server_config.py
└── jupyter_server_config.d
  ├── notebook.py|json
  ├── lab.py|json
  └── my_extension.py|json
```

**Migration application**

To make migration easier on users, the jupyter server will include a `migrate` application to split notebook and server configurations into their appropriate locations (listed above). This application will find any `jupyter_notebook_config.py|json` files in `jupyter --paths`, read configured traits, sort server vs. notebook traits, and write them to the appropriate `jupyter_server_config.py|json` and `jupyter_notebook_config.py|json` files.


### How this effects other projects

[**Classic notebook**]()
In short, the classic notebook will become a server extension application. The rest of this proposal describes the details behind what will change in the notebook repo.
[`JupyterServerExtensionApp`](). 

[**Jupyter Lab**]()
Jupyter lab will also become a server extension application. The new classes described above should simplify the way JupyterLab interfaces with the server.

[**Kernel Gateway**]()
Kernel Gateway writes custom `kernel` and `kernelmanager` services and load them as server extensions. 

[**Kernel Nanny**]()

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

Moving to a `conf.d` approach.
* PR [3116](https://github.com/jupyter/notebook/pull/3116), `jupyter/notebook`: extension config in `config.d` directory.
* PR [3782](https://github.com/jupyter/notebook/issues/3782), `jupyter/notebook`: server extension use `conf.d` approach
* PR [2063](https://github.com/jupyter/notebook/issues/2063), `jupyter/notebook`: config merging problems.

Conversation on server/notebook extensions:
* PR [1706](https://github.com/jupyter/notebook/issues/1706), `jupyter/notebook`: proposal to improve server/notebook extensions
* PR [2824](https://github.com/jupyter/notebook/issues/2824), `jupyter/notebook`: enable nbextensions by default

Static Namespace:
* PR [21](https://github.com/jupyter/enhancement-proposals/pull/21#issuecomment-248647152)`jupyter/enhancement-proposals`: mention namespacing.

## Interested

@Zsailer, @SylvainCorlay, @ellisonbg, @blink1073, @kevin-bates