# Simplifying error reporting in the Jupyter protocol

## Motivation

There are currently two ways for a kernel to signal an error when executing
code:

- Sending a message of type `error` on the IOPub socket.
- Setting `status: "error"` (and associated error detail fields) in the
  `execute_reply` message on the shell socket.

This duplication has led to frontends missing errors where the kernel only
indicates it one way, and the frontend only looks for the other indication.
For instance: [nbconvert issue 641](https://github.com/jupyter/nbconvert/issues/641)
and [qtconsole issue 140](https://github.com/jupyter/qtconsole/issues/140).

To avoid this, kernels try to indicate errors with both mechanisms, and
frontends try to check both. This results in unnecessary added complexity in
multiple projects.

## Proposal: where we want to end up

There are two significant parts for reporting an error:

1. A machine-readable indication that some error occurred.
2. Human-readable information about the error (e.g. error message, traceback)

The proposal is that, in a future major revision of the message format, we will
have the status field of the `execute_reply` message to convey 1, and use
standard output messages, such as `display_data`, to convey 2.

There will no longer be an `error` message type for IOPub, and `execute_reply`
messages will no longer have fields `ename`, `evalue` and `traceback`.

So far, there has been little need for semantic information about the details
of the error. [Nbval](https://github.com/computationalmodelling/nbval) is one
exception: it can check that the exception type has not changed. To preserve
this ability, `error_type` (renamed for clarity) will become a standard but
optional metadata key on output messages.

## Transition plan

1. Deprecate the `error` message type.
2. Encourage frontends which need to detect errors to do so using `execute_reply`.
3. Deprecate the `ename`, `evalue` and `traceback` fields in `execute_reply`:
   they must still exist for the message to be valid, but clarify that they
   can be empty.
4. In message spec 6.0, remove the `error` message type, and the three error
   fields from `execute_reply`.

### Converting v5 messages to v6

- Remove `ename`, `evalue` and `traceback` from `execute_reply` messages.
- Convert `error` messages to `display_data` with plain text content.

### Converting v6 messages to v5

- For `execute_reply` messages with `status: "error"`, set `ename`, `evalue`
  and `traceback` to suitable default values.
