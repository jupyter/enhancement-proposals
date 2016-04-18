# Kernel 'nanny' processes

## Summary

We propose to start Jupyter kernels through a 'nanny' process, which will always
be running on the same machine as its associated kernel. This offers various
advantages over the current situation, including:

- Kernels will no longer need to implement the 'heartbeat' for frontends to
  check that they are still alive.
- We will be able to interrupt remote kernels (SIGINT cannot be sent over the network)
- There will be a consistent way to start kernels without a frontend
  (`jupyter kernel --kernel x`).
- Kernel stdout & stderr can be captured at the OS level, with real-time updates
  of output.

## The basics

When a frontend wants to start a kernel, it currently instantiates a `KernelManager`
object which reads the kernelspec to find how to start the kernel, writes a
connection file, and launches the kernel process. With this process, it will
instead launch the kernel nanny on the machine where the kernel is to run, and
the nanny will be responsible for creating the connection file and launching
the kernel process.

**Rejected alternative:** One kernel nanny process per machine, able to start
multiple kernels. This would be more complex, but we may come back to it later
if the overhead of one nanny per kernel is too much.

## Socket connections

Currently, the frontend connects to five sockets to communicate with the kernel:

* Shell
* Control (priority, used for shutdown)
* Iopub (kernel to frontend only, for output)
* Stdin (used to request input from the frontend)
* Heartbeat

Of these, shell and stdin will remain connected directly between the kernel and
the frontend. Control and iopub (see output capturing) will be connected through
the nanny, i.e. each channel will have one socket for communications between
the frontend and the nanny, and a second socket for communications between the
nanny and the kernel. (*TODO: What are these called in the connection file? Or
do we have two connection files?*) The heartbeat will only be between the
frontend and the nanny, to detect situations such as network failures.

## Messaging changes

* A new message type on the control channel from the frontend to the nanny,
  instructing the nanny to shut down the kernel.
* A new message type on the control channel from the frontend to the nanny,
  instructing the nanny to signal/interrupt the kernel. (*TODO: Expose all Unix
  signals, or just SIGINT?*)
* Heartbeat becomes a broadcast signal from the nanny to all connected frontends,
  rather than a REP/REQ pattern (which was only the case before because pyzmq
  makes it easy to echo messages without grabbing the GIL).
* New broadcast message from nanny to frontends when kernel dies unexpectedly,
  including exit status.
* New end of output message, from nanny to frontends? (*TODO: yes/no?*)

## Output capturing

In IPython, we capture stdout/stderr at the Python level (sys.std*). Code which
writes to stdout/stderr at a lower level (e.g. C extensions) will send its output
to the terminal where the frontend was started, instead of to the frontend.
Many other kernels suffer from similar issues.

We know of tricks using `dup2` to redirect the low-level file handles within the
kernel, but we don't want each kernel to reimplement this, and it is not
possible on Windows.

To this end, when the kernel nanny starts the kernel, it will be able to create
stdout and stderr as pipes, and turn data read from them into *stream* messages
to be sent to the frontend via the iopub channel. However, this may make
debugging difficult or show unwanted output if kernel authors are using the
terminal to debug the kernel implementation. Therefore, output capturing will
only be enabled if the kernel opts in via its `kernel.json` specification:

    "capture_stdstreams": true

### Output synchronisation

With this proposal, there are multiple asynchronous channels for output coming
from the kernel: the `iopub` socket from the kernel to the nanny, and the pipes
carrying stdout and stderr. At present, the `status` message with
`execution_state: idle` marks the end of output on the iopub channel.

Kernels that opt in to output capturing should print a delimiter (*TODO: define
delimiter*) on each of stdout and stderr, before and after running user code.
The delimiter will include the message ID of the execute_request message.
The nanny will not forward these to the frontend, but will use the 'before'
delimiters to indicate which execution output resulted from, and the 'after'
delimiters to detect when stream output is finished. The nanny will tell the
frontend when all output from an execute_request, on iopub and the two pipes,
is complete (*TODO: using status:idle, or a new message?*).

**Rejected alternative:** Frontends monitoring when output is complete on each
channel. The frontend output handling logic would have to know whether the
kernel in use used output capturing or not, and the logic would have to be
written for each frontend. With the scheme we decided upon, the logic must only
be implemented once in the nanny process, and the frontend can remain ignorant
of whether the kernel has enabled output capturing.

### Kernel logging

Where kernels have been previously using low-level stdout/stderr to log to the
terminal, they need a new way to produce diagnostic logs which shouldn't be
displayed in the frontend. Kernels opting in to output capturing will be
started with an environment variable `JUPYTER_KERNEL_LOG` set. The kernel
should treat this as a filesystem path, which it can open and write logs to.

Kernels should make minimal assumptions about the type of file they are opening.
It may be a regular file, a FIFO (or named pipe), or the slave end of the tty
where the frontend was started, on systems where that is possible. This will
likely depend on configuration settings in the frontend, and possibly on how the
frontend is started. It should never be a directory, however.
