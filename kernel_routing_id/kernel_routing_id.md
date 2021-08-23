# Set ZMQ\_IDENTITY of router sockets

## Current specification

A jupyter kernel uses router sockets to receive messages on the shell and control channel. The current specification
does not put any constraint on the **ZMQ_IDENTITY** attribute of these sockets. Therefore, most of the implementations
(if not all) rely on the default behavior of ZMQ which is to set a random value upon connection.

This allows to use these sockets in the DEALER (client) - ROUTER (kernel) or REQ (client) - ROUTER (kernel) patterns,
but prevents to use the ROUTER (client) - ROUTER (kernel) pattern.

## Proposed enhancement

We propose to set the **ZMQ_IDENTITY** to a value known by the clients, so that it is possible to implement
a ROUTER - ROUTER pattern. This pattern is particularly useful when a single client wants to talk to many
kernels and we want to avoid opening a lot of sockets. It is also a perfect solution for a multiplexer component
that routes messages from many clients to different kernels.

A common pattern is to use the socket's endpoint as its identity. Since the client already knows to which endpoint
it will connect, this avoids complex additional excahnges between the client and the kernel, or complex additional
configuration.

## Impact on existing implementations

This requires a minor change in all the existing kernels, but this is a single line change.
