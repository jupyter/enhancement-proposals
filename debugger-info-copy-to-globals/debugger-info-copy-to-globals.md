---
title: Debugger support to copyToGlobals
authors: Nicolas Brichet (@brichet)
issue-number: xxx
pr-number: xxx
date-started: 2023-02-20
---

# Summary

This JEP introduces a new field to the kernel debugger_info response. This new
field will inform the UI that the debugger supports the `copyToGlobals` request.

# Motivation

The `copyToGlobals` request has been introduced in
[ipykernel](https://github.com/ipython/ipykernel/pull/1055) and in
[xeus-python](https://github.com/jupyter-xeus/xeus-python/pull/562) to copy a local
variable to the global scope during a breakpoint. It would be useful to inform the
UI if this is supported by the kernel before displaying the corresponding menu entry.

# Proposed Enhancement

We propose to add a new `copyToGlobals` boolean field to the `debugger_info`
response which will inform the UI that this request is supported.

## Reference-level explanation

This boolean flag should be included in the `debugger_info` response from the kernel
which supports the feature. It is optional, assuming that its absence is understood
as `false` from the client perspective.

If the feature is supported, the kernel must provide a function for copying a variable
from a local scope to the global scope.
The communication between the UI and the kernel (request - response) will have the
structures described at
https://jupyter-client.readthedocs.io/en/latest/messaging.html#copytoglobals.

- Request (from UI to kernel)

  ```python
  {
    'type': 'request',
    'command': 'copyToGlobals',
    'arguments': {
      # the variable to copy from the frame corresponding to `srcFrameId`
      'srcVariableName': str,
      'srcFrameId': int,
      # the copied variable name in the global scope
      'dstVariableName': str
    }
  }
  ```

- Response (from kernel to UI)

  ```python
  {
    'type': 'response',
    'success': bool,
    'command': 'setExpression',
    'body': {
      # string representation of the copied variable
      'value': str,
      # type of the copied variable
      'type': str,
      'variablesReference': int
    }
  }
