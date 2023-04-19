---
title: kernelspec specification
authors: Johan Mabille
issue-number: XX
pr-number: XX
date-started: "2023-04-19"
---

# Specification of the kernelspec

## Problem

The kernelspec configuration file is documented aside the kernel protocol documentation, but it is not
*specified*. Besides, it might be unclear whether the kernelspec is part of the kernel protocol, or
independent.

## Proposed Enhancement

We propose to specify the kernelspec with the JSON schema joined in this PR. The specification is conform
to [the current description of the kernelspec](https://jupyter-client.readthedocs.io/en/stable/kernels.html#kernel-specs),
and adds an optional `protocol_version` field.

[A dedicated repo](https://github.com/jupyter-standards/kernelspec) for the specification and the documentation of
the kernelspec has been created.

### Impact on existing implementations

None, this JEP only adds an optional field in the kernelspec.

