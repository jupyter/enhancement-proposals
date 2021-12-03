# Send kernel\_info request on the control channel

## Problem

When connecting a new websocket to an existing kernel via the Jupyter server, if the kernel execution is
stopped on a breakpoint, the messages sent over the websocket get no reply. This is because when
establibshing a new websocket connection, the Jupyter server will send `kernel_info` requests to the kernel
and will prevent sending any other request until it receives a `kernel_info` reply. Since the `kernel_info`
request is sent on the shell channel and the kernel executino is stopped, it cannot reply to that request.

## Proposed enhancement

We propose to state in the Jupyter Messaging Protocol that the `kernel_info` request muter st be sent on the
control channel exclusively.

### Impact on existing implementations

There should not be any impact on the existing kernels, since the current specification states that any message
that can be sent on the shell channel could be sent on the control channel.

The only impact of this change (beyond the protocol itself) is on the Jupyter Server, which must be updated
accordingly.

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

