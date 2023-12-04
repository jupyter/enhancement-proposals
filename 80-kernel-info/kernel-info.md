# Support kernel\_info request on the control channel

## Problem

When connecting a new websocket to an existing kernel via the Jupyter server, if the kernel execution is
busy (e.g. long running cell) or stopped (e.g. on a breakpoint), the messages sent over the websocket get no reply. This is because when
establishing a new websocket connection, the Jupyter server will send `kernel_info` requests to the kernel
and will prevent sending any other request until it receives a `kernel_info` reply. Since the `kernel_info`
request is sent on the shell channel and the kernel execution is stopped, it cannot reply to that request.

## Proposed enhancement

We propose to state in the Jupyter Messaging Protocol that the `kernel_info` request can be sent on both the shell and the control channels. Although both channels supports the `kernel_info` message, clients are encouraged to send it on the control channel as it will always be able to handle it, while the shell channel may be stopped.

### Impact on existing implementations

This JEP impacts kernels since it requires them to support receiving 'kernel\_info\_request' on the control channel in addition to receiving them on the shell channel.

It also has an impact on the Jupyter Server. For example, the reference implementation of Jupyter Server will attempt to send a a `kernel_info` request on both channels and listen for a response from _either_ channel. Any response informs the UI that the kernel is connected. 

## Relevant Resources (GitHub repositories, Issues, PRs)

### GitHub repositories

- [Jupyter server](https://github.com/jupyter-server/jupyter_server): the backend to Jupyter web applications
- [Jupyter client](https://github.com/jupyter/jupyter_client):  Jupyter protocol client APIs
- [JupyterLab](https://github.com/jupyterlab/jupyterlab): JupyterLab computational environment

### GitHub Issues

- New websocket unable to communicate with kernel paused in debugging [#622](https://github.com/jupyter-server/jupyter_server/issues/622)
- [Debugger] Active sessions cause the kernel to deadlock on page refresh [#10174](https://github.com/jupyterlab/jupyterlab/issues/10174)

### GitHub Pull Requests

Nudge kernel with info request until we receive IOPub messages [#361](https://github.com/jupyter-server/jupyter_server/pull/361)

