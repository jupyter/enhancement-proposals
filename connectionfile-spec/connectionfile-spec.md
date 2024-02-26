---
title: connection file specification
authors: Johan Mabille
issue-number: XX
pr-number: XX
date-started: "2023-04-19"
---

# Specification of the connection file

## Problem

The connection file is [documented](https://github.com/jupyter/jupyter_client/blob/main/docs/kernels.rst) aside the kernel protocol documentation, but it is not *specified*.

## Proposed Enhancement

We propose to specify the connection file with the JSON schema joined in this PR. The specification would reflect
[the current description of the connection file](https://jupyter-client.readthedocs.io/en/stable/kernels.html#connection-files).

The documentation of the connection file will be stored along side [those of the kernel protocol](https://github.com/jupyter-standards/kernel-protocol) while its specification will be stored in the [Jupyter schema repo](https://github.com/jupyter/schema).

### Impact on existing implementations

None, this JEP only specifies the current implementations.
