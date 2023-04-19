# Kernel Handshaking pattern

## Problem

The current implementation of Jupyter client makes it responsible for finding available ports and pass them to a new starting kernel. The issue is that a new process can start using one of these ports before the kernel has started, resulting in a ZMQError when the kernel starts. This is even more problematic when spawning a lot of kernels in a short laps of time, because the client may find available ports that have already been assigned to another kernel.

A workaround has been implemented for the latter case, but it does not solve the former one.

## Proposed Enhancement

We propose to implement a handshaking pattern: the client lets the kernel find free ports and communicate them back via a dedicated socket. It then connects to the kernel. More formely:

- When the client starts, it opens a dedicated socket A for receiving connection information from kernels (channel ports).
- When launching a new kernel, the client passes its address and the port of this socket to the kernel.
- The kernel starts, find free ports to bind the shell, control, stdin, heartbeat and iopub sockets. It then connect to the A socket and send the connection information to the client.
- Upon reception of the connection information, the client connects to the kernel.

The way the client passes its address and the port of the listening socket to the kernel should be similar to that of passing the ports of the kernel socket in the current implementation: a connection file that can be read by local kernels or sent over the network for distant kernels (although this requires an intermediate actor such as a gateway).

The kernel specifies whether it supports the handshake pattern via the "kernel_protocol_version" field in the kernelspec:
- if the field is missing, or if its value if less than 5.5, the kernel supports passing ports only.
- if the field value is >=5.5 and <6, the kernel supports both mechanisms.
- if the field value is >=6, the kernel supports the handshake pattern. Clients should not assume the kernel still supports the old mechanism.

### Impact on existing implementations

Although this enhancement requires changing all the existing kernels, the impact should be limited. Indeed, most of the kernels are based on the kernel wrapper approach, or on xeus.

Most of the clients are based on `jupyter_client`. Therefore, the changes should be limited to this repository only.

A transition period where clients and kernels support both mechanisms should allow kernels to gradually migrate to the new version of the protocol. The support of the handshaking pattern should be indicated in the kernelspec.

## Relevant Resources (GitHub repositories, Issues, PRs)

### GitHub repositories

- Jupyter Client: https://github.com/jupyter/jupyter_client
The Jupyter protocol client APIs
- Voilà: https://github.com/voila-dashboards/voila
Voilà turns Jupyter notebooks into standalone web applications
- IPyKernel: https://github.com/ipython/ipykernel
IPython kernel for Jupyter
- Xeus: https://github.com/jupyter-xeus/xeus
The C++ implementation of the Jupyter kernel protocol

### GitHub Issues

- Spawning many kernels may result in ZMQError (https://github.com/jupyter/jupyter_client/issues/487)
- Spawning ~20 requests at a time results in a ZMQError  (https://github.com/voila-dashboards/voila/issues/408#issuecomment-539968325)

### GitHub Pull Requests

- Prevent two kernels to have the same ports (https://github.com/jupyter/jupyter_client/pull/490)
