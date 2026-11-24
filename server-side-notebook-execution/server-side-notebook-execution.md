---
title: Standardizing the Server-Side Notebook Execution API
authors:
  - name: David Brochart
    github: davidbrochart
issue-number: 157
pr-number: null
date-started: 2026-11-17
---

# Standardizing the Server-Side Notebook Execution API

## Summary

This JEP proposes a common HTTP API for executing notebook cells on a Jupyter server. A client identifies a notebook, a kernel, and the cells to execute. The server validates and queues the cells, sends execution requests to the kernel using the existing Jupyter messaging protocol, and writes the results to the shared notebook document. Clients observe those results through the existing collaboration synchronization mechanism.

## Motivation

Jupyter frontends traditionally initiate cell execution over kernel WebSockets and apply the resulting outputs to the notebook. This puts the frontend in charge of collecting results even when the kernel and notebook are hosted on a server. If a user disconnects while cells are running, their frontend can no longer apply those results. With server-side execution, the server continues writing results to the shared notebook, where the user can see them after reconnecting and collaborators can see them as they arrive. An HTTP API also lets other applications submit cells for execution without running a notebook frontend.

This calls for a JEP because interoperability depends on an agreement between server and frontend projects. A shared specification gives servers a common contract to implement and lets frontends use the same execution workflow across them.

## Guide-level explanation

When a user runs one or more cells, the frontend sends the ID and source hash of each cell to the server in a single request. The hashes represent the cell source the user saw when they requested execution. If another collaborator's edit has already reached the server and changed any requested cell, the server rejects the entire request. The frontend can synchronize the document and let the user decide whether to run the updated cells.

An HTTP `200` means the batch has been queued. As the kernel executes the cells, the server writes outputs, execution counts, and execution states to the shared document. The initiating frontend and other collaborators receive these updates through document synchronization. A frontend can also request ordering across its own batches so rapid requests enter the queue in the intended order even if they arrive at the server out of order.

## Reference-level explanation

### Endpoint and request

```http
POST /api/kernels/{kernel_id}/execute
```

```json
{
  "document_id": "json:notebook:<file_id>",
  "cells": [
    {
      "cell_id": "cell-1",
      "source_hash": "123456789"
    },
    {
      "cell_id": "cell-2",
      "source_hash": "987654321"
    }
  ],
  "client_id": "12345",
  "sequence": 0,
  "request_id": "uuid"
}
```

- `document_id` identifies the notebook document.
- `cells` lists the cells in the order they should be enqueued. Each entry identifies a cell and includes its required `source_hash`. Compute the hash using MurmurHash2 with seed 0 over the UTF-8 encoding of the cell source and send it as a decimal string. The example uses illustrative hashes.
- `sequence` is optional. It is a non-negative integer that starts at `0` and increases by one for each sequenced request. When present, it requires `client_id`. Each sequence is scoped to the document, kernel, and client.
- `request_id` is an optional opaque identifier for logging and tracing.

### Validation and enqueueing

1. Resolve the notebook document. If the request is sequenced and earlier requests have yet to arrive, wait for its turn.
2. Resolve the requested cells and validate every source hash against the server's document state.
3. If validation fails, reject the whole batch without enqueueing any cells. A sequenced request that reaches its turn consumes its sequence slot even if validation fails.
4. Enqueue all cells as a single batch, preserving their order, and return `200` once they are enqueued.
5. Execute the cells through the associated kernel and write their outputs, execution counts, and execution states to the shared notebook. Clients receive those changes through document synchronization.

Sequence ordering governs enqueueing. For example, if request `1` arrives before request `0`, it waits until request `0` has had its turn. The server can accept request `1` while cells from request `0` are still executing.

### Sequence reset and timeout

- If a nonzero sequence is below the next expected value, the server rejects it with `400`.
- If sequence `0` arrives after the counter has advanced, the server starts a fresh sequence for that client and releases requests still waiting in the previous sequence with `409` and reason `reset`.
- A kernel disconnect resets sequencing and releases pending requests with the same `409` response. An in-place kernel restart preserves sequencing.
- If an earlier request fails to arrive before the ordering timeout, the server releases requests waiting behind the gap with `409` and reason `timeout`. The timeout is configurable and defaults to 10 seconds.
- After an execution request fails, the frontend should begin its next sequence at `0` with a new `client_id` and let the user rerun the affected cells.

### Responses

| Status | Meaning | Response body |
| --- | --- | --- |
| `200` | Request accepted and cells enqueued | |
| `400` | Invalid request, cell, or sequence | |
| `409` | A cell's source hash differs | `{"error":"source_mismatch","cell_id":"…"}` |
| `409` | The wait for an earlier sequence expired | `{"error":"session_reset","reason":"timeout"}` |
| `409` | A client sequence reset or kernel disconnect ended the wait | `{"error":"session_reset","reason":"reset"}` |

### Relationship to existing Jupyter protocols

Kernels continue to receive standard execution requests and produce standard kernel messages. Existing client-driven execution remains supported. With the HTTP endpoint, the server consumes the kernel's execution results and applies them to the shared notebook document.

## Rationale and alternatives

Server-side execution lets a batch continue independently of the initiating client's connection. Reusing document synchronization gives collaborators a common view of execution results without requiring a second channel for those results.

Keeping execution orchestration entirely in the frontend preserves the existing kernel WebSocket workflow but ties output handling to that client.

[Jupyverse](https://github.com/jupyter-server/jupyverse), [jupyter-server-documents](https://github.com/jupyter-ai-contrib/jupyter-server-documents), and [jupyter-server-nbmodel](https://github.com/datalayer/jupyter-server-nbmodel) already implement server-side notebook execution. In the absence of a shared specification, each project has defined its own API, so frontends must account for implementation-specific differences. Standardizing the request format and execution behavior gives frontends a common API across servers.

## Prior art

[Jupyverse PR #191](https://github.com/jupyter-server/jupyverse/pull/191) first introduced HTTP-triggered cell execution with results propagated through the shared notebook document. [jupyter-server-documents](https://github.com/jupyter-ai-contrib/jupyter-server-documents) and [jupyter-server-nbmodel](https://github.com/datalayer/jupyter-server-nbmodel) built on that approach.

[jupyter-server-documents PR #248](https://github.com/jupyter-ai-contrib/jupyter-server-documents/pull/248) established the starting API and addressed source consistency, ordering, batch execution, and collaboration. [PR #323](https://github.com/jupyter-ai-contrib/jupyter-server-documents/pull/323) updated request ordering to use a per-client sequence counter.

## Unresolved questions

- How should the server route kernel stdin requests (`input_request`) to a frontend and relay its `input_reply`? What should happen if no frontend is connected or several collaborators can reply?
- How should the server apply updates to existing outputs in the shared notebook, such as `update_display_data` messages targeting a `display_id`?

## Future possibilities

The HTTP endpoint could eventually become the sole API for notebook execution. Before retiring WebSocket-based notebook execution, the server-side API would need to support workflows that rely on it today, including interactive stdin and updates to existing outputs. Servers and frontends would need to adopt the API, and clients would need a deprecation period to migrate.

Removing the kernel WebSocket endpoint entirely would also require a migration path for its other uses, including non-notebook clients and Jupyter widgets. Widgets use Comm messages over the kernel WebSocket to exchange state updates and interaction events between the frontend and the kernel. A replacement transport would need to preserve that bidirectional communication for as long as widgets remain active. One possible approach is to use conflict-free replicated data types (CRDTs) to synchronize widget state between the kernel and frontends, as demonstrated by [ypywidgets](https://github.com/QuantStack/ypywidgets).
