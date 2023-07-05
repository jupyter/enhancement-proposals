---
title: Kernel Handshaking pattern
authors: Johan Mabille (@JohanMabille)
issue-number:
pr-number: 66
date-started: 2021-01-05
---

# Kernel Handshaking pattern

## Problem

The current implementation of Jupyter client makes it responsible for finding available ports and pass them to a new starting kernel. The issue is that a new process can start using one of these ports before the kernel has started, resulting in a ZMQError when the kernel starts. This is even more problematic when spawning a lot of kernels in a short laps of time, because the client may find available ports that have already been assigned to another kernel.

A workaround has been implemented for the latter case, but it does not solve the former one.

## Proposed Enhancement

We propose to implement a handshaking pattern: the client lets the kernel find free ports and communicate them back via a dedicated socket. It then connects to the kernel. More formally:

- The kernel launcher is responsible for opening a dedicated socket for receiving connection information from kernels (channel ports). This socket will be referred as the **registration socket**.
- When starting a new kernel, the launcher passes the connection information for this socket to the kernel.
- The kernel starts, finds free ports to bind the shell, control, stdin, heartbeat and iopub sockets. It then connects to the registration socket and sends the connection information to the registration socket.
- Upon reception of the connection information, the launcher sends an acknowledge receipt to the kernel, and the client connects to the kernel.

The way the launcher passes the connection information for the registration socket to the kernel should be similar to that of passing the ports of the kernel socket in the current connection pattern: a connection file that can be read by local kernels or sent over the network for remote kernels (although this requires a custom kernel provisioner or "nanny"). This connection file should also contain the signature scheme and the key.

Reagarding the registration socket lifetime:

- The kernel launcher MAY close the registration socket after completing a kernel's registration. Therefore, the kernel should disconnect from the registration socket right after it has received the acknowledge receipt. A kernel should shutdown itself if it does not receive an acknowledge receipt after some time (the value of the time limit is let to the implementation).
- To restart a kernel will require the registration socket again, so the kernel launcher SHOULD keep the registration socket open if it expects restarts to be possible, or open a new socket and pass the new registration socket URL to the new process.

The kernel should write its connection information in a connection file so that other clients can connect to it.

The kernel specifies whether it supports the handshake pattern via the "kernel_protocol_version" field in the kernelspec:
- if the field is missing, or if its value if less than 5.5, the kernel supports passing ports only.
- if the field value is >=5.5, the kernel supports both mechanisms.

### Remarks

This pattern is **NOT** a replacement for the current connection pattern. It is an additional one and kernels will have to implement both of them to be conformant to the Jupyter Kernel Protocol specification. Which pattern should be used for the connection is decided by the kernel launcher, depending on the information passed in the initial connection file.


A recommended implementation for a multi-kernel client (i.e. jupyter-server) is to have a single long-lived registration socket.

### Impact on existing implementations

Although this enhancement requires changing all the existing kernels, the impact should be limited. Indeed, most of the kernels are based on the kernel wrapper approach, or on xeus.

Most of the clients are based on `jupyter_client`. Therefore, the changes should only be limited to this repository or external kernel provisioners.

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
