# Standalone Jupyter Server

## Problems

 - There are now multiple frontends that can talk to the backend services provided by the notebook server: the legacy Notebook, the dashboards, JupyterLab, standalone widgets and more.
 - The configuration of the server and the legacy notebook are currently tightly coupled in a single NotebookApp configurable.
 - The migration towards a `conf.d` approach, which is required for enabling a better mechanism for distributing extensions, is unlikely to be accomplished in a backward compatible fashion.

## Proposed Enhancement

1. The Big Split

  The last remaining step of the big split of the notebook repository is simply a clean separation of the server and the pure front-end code.

  - Create a new `jupyter server` repository that would essentially be a fork of the current `notebook` repository.
  - This notebook should be a pure Python package (`server`?) that only provides the backend services.
  - The specific tornado handlers added to support the legacy notebook frontend would not be provided.
  - Deprecated APIs of the notebook server would not be carried over to the new server.
  - The `jupyter server` repository has only *one* extension point: server extensions. The command name for enabling or installing server extensions will have to be different from the current server extension to avoid conflict. (e.g. `jupyter server extension install`).

2. The Extension Mechanism

  The extension mechanism for the *jupyter server* will be the main area where `server` extensions differ from notebook's server extensions.

    - The `--sys-prefix` installation would become the default. (Users are confused when enabling an extension requires more permissions than the installation of the package). Installation in system-wide directories would be done with the `--system` option. 
    - Installing an extension will include the addition of a 'manifest' file into a conf.d directory (under one of the Jupyter configuration directories, `user / sys-prefix / system`). The placement of such an extension manifest provided by a Python package can be done with `jupyter server extension install --py packagename [--user / --system / --sys-prefix]`. Packages (conda or wheels) carrying server extensions could place such manifests in the sys-prefix path by default effectively installing them. Development installations would also require the call to the installation command.
    - Enabling an extension is separate from the installation. Multiple scenarios are possible:

       - enabling an extension at the same level (user / sys-prefix / system) as where it was installed, or at a higher level (user for sys-prefix and system, or sys-prefix for system).
       - forcibly disabling an extension that was enabled at a lower level of precedence.
       - forcibly enabling an extension that was disabled at a lower level of precedence.

      This would be done via two `conf.d` configuration directories managing a list of disabled extensions and list of enabled extensions in the form of empty files having the name of the corresponding extension. If an extension is both disabled and enabled at the same level of precedence, disabling has precedence. Packages (conda or wheels) could place such a enabler file in the sys-prefix path by default. The `jupyter server extension enable` command would be required for development installations.

    - (Possibly) when an extension is enabled at a given precedence level, it may only look for the version of the extension installed at the same or lower precedence level. For example, if an extension `foobar` is installed and enabled system wide, but a user installs a version with `--user`, this version will only be picked up if the user also enables it with `--user`.


3. The Notebook Extension

  The legacy Notebook should become an server extension, just like JupyterLab is a server extension.

  Eventually *some* front-end content could be provided by server such as a simple app listing installed and enabled extensions...