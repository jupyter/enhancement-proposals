---
title: kernelspec specification
authors: Johan Mabille
issue-number: XX
pr-number: [#105](https://github.com/jupyter/enhancement-proposals/pull/105)
date-started: "2023-04-19"
---

# Specification of the kernelspec

## Problem

The kernelspec configuration file is [documented](https://github.com/jupyter/jupyter_client/blob/main/docs/kernels.rst) aside the kernel protocol documentation, and an [implementation](https://github.com/jupyter/jupyter_client/blob/main/jupyter_client/kernelspec.py#L21) is available, but it is not *specified*. Besides, it might be unclear whether the kernelspec is part of the kernel protocol, or independent.

## Proposed Enhancement

We propose to specify the kernelspec with the JSON schema joined in this PR. The specification would reflect
[the current description of the kernelspec](https://jupyter-client.readthedocs.io/en/stable/kernels.html#kernel-specs),
and adds an optional `kernel_protocol_version` field.

The documentation of the kernelspec will be stored aside [that of the kernel protocol](https://github.com/jupyter-standards/kernel-protocol). The schema will be stored in the [dedicated repo for all Jupyter schemas](https://github.com/jupyter/schema).

### Impact on existing implementations

None, this JEP only adds an optional field in the kernelspec.

