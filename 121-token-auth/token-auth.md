---
title: Websocket token authentication with subprotocols
authors: Min RK
issue-number: 119
pr-number: 121
date-started: 2024-03-26
---

## Summary

Jupyter servers shall accept auth tokens in the `Sec-WebSocket-Protocol` header,
as is done for other API requests in the `Authorization` header,
which is unavailable to websocket connections from browsers.
The token shall be sent as:

```
Sec-WebSocket-Protocol: v1.token.websocket.jupyter.org, v1.token.websocket.jupyter.org.{url-token}
```

where `{url-token}` is the url-encoded token (as produced by `encodeURIComponent` in javascript).

This is fully backward-compatible.

## Motivation

Combining these facts:

- Jupyter Servers (often) use API tokens for authentication
- auth tokens are typically passed in the Authorization header
- websockets cannot pass tokens in Authorization headers because the browser implementation [forbids it](https://github.com/whatwg/websockets/issues/16), though most implementations outside the browser do support it.
  As a result, websocket requests must pass tokens in a URL parameter.
- Passing tokens in a URL parameter is generally frowned upon, but not strictly insecure and indeed [explicitly recommended by Browser websocket implementers](https://github.com/whatwg/websockets/issues/16#issuecomment-347180825)

motivates having a new mechanism by which to pass the auth token for websocket requests that's not in the URL.

There is a scheme [devised by Kubernetes](https://github.com/kubernetes/kubernetes/commit/714f97d7baf4975ad3aa47735a868a81a984d1f0), where the subprotocols API allows specifying the Sec-Websocket-Protocol header, and we can put the token in there.

## Guide-level explanation

Many Jupyter server requests are authenticated with an API token.
Currently, the API token may be specified in either the `Authorization` header or a `?token=` url parameter.
Sending credentials in URL parameters is generally advised against, so `Authorization` is used in most API requests.
However, the standard websocket API provided by browsers cannot set the `Authorization` header, so browser clients resort to sending the token in the url parameter in most cases.
Websockets can, however, set the `Sec-Websocket-Protocol` header to a _list_ of values.

This proposal adds a scheme for sending auth tokens in the `Sec-Websocket-Protocol` header.

In general, this should be considered equivalent to sending tokens in the Authorization header which we do for all non-websocket API requests, but specifying the mechanism by which the token is transmitted when the for websocket requests when the Authorization header is unavailable.

Adopting this scheme allows the removal of tokens from URLs, which is flagged by some security policies.

### For clients

Affected projects:

- mainly `@jupyterlab/services`
- any other client that connects to Jupyter Server websockets from browsers

In the new authentication scheme, clients should request at least two subprotocols:

- `v1.token.websocket.jupyter.org`
- `v1.token.websocket.jupyter.org.${token}` where `${token}` is replaced by the token itself (url-encoded, as needed).

For example:

```javascript
ws = new WebSocket(wss://..., ['v1.token.websocket.jupyter.org', `v1.token.websocket.jupyter.org.${encodeURIComponent(token)}`, ...])
```

which sets the header:

```
Sec-WebSocket-Protocol: v1.token.websocket.jupyter.org, v1.token.websocket.jupyter.org.abc123
```

If the token is accepted, the response will have the header:

```
Sec-WebSocket-Protocol: v1.token.websocket.jupyter.org
```

The reason for the double subprotocol is that if _any_ subprotocol is requested, the response _must_ include one of the requested subprotocols for the connection to be accepted by all browsers.
Not all browser require this, but Chrome does. The `v1.token.websocket.jupyter.org` serves no purpose if there is already a subprotocol defined and required, and should be optional in that case.

#### Backward compatibility

This mechanism does not replace any other mechanisms, it is purely additional.
A server that does not support the new scheme may reject a websocket connection with e.g. status 403, as if no token was provided.
For clients to be backward compatible, they should first attempt the new scheme before falling back on an old scheme:

1. try a connection with the new scheme,
2. on failure
   a. try again with an old scheme (e.g. `?token=...` in URL), or
   b. raise error if requiring new scheme is desired

There is already precedence for this retry pattern in JupyterLab for handling the kernel subprotocol.

Clients that can send the token in the Authorization header may continue to do so without adopting the new scheme.
The new scheme is specifically for clients that cannot set standard headers, i.e. browsers,
it does not replace the use of the `Authorization` header where it is already available.

### For servers

Affected projects:

- jupyter-server
- jupyverse

Before accepting a connection, a server should check the Sec-Websocket-Protocol header.
If one of the protocols listed matches `v1.token.websocket.jupyter.org.{token}`, the token should be checked.
The token should be url-decoded (e.g. `token = urllib.parse.unquote(token)`).
Handling of the token should be identical to an `Authorization: Bearer {token}`.
If the token is accepted, the first supported subprotocol should be selected.

In tornado, this is implemented in the [`select_subprotocol`](https://www.tornadoweb.org/en/stable/websocket.html#tornado.websocket.WebSocketHandler.select_subprotocol) method on `WebSocketHandler`.

### Considerations

When a websocket protocol is requested, the server must 'accept' one of the requested protocols.
As a result, if a server doesn't implement subprotocol handling, clients must retry with an older scheme.

This allows client and server security policies that may _reject_ auth tokens in URLs when the new scheme can be assumed.
Specifying how/whether to do that is out of scope for this JEP.

## Reference-level explanation

### Clients

Websocket clients SHALL transmit API tokens in the `Sec-Websocket-Protocol` header.

- Token MUST be in the form `v1.token.websocket.jupyter.org.{token}`
- Token MUST be url-encoded, e.g. via `encodeURIComponent(token)`
- Subprotocol MUST include at least one OTHER subprotocol that is REQUIRED.
  If no exiting subprotocol is REQUIRED, the subprotocol `v1.token.websocket.jupyter.org` MUST be included.
- Token-encoded subprotocol field SHALL be after the first REQUIRED subprotocol

In general, this will look like:

```javascript
ws = new WebSocket(
  'wss://...',
  [
    // additional subprotocols, if applicable
    'v1.token.websocket.jupyter.org', // required IF no other subprotocols are REQUIRED
    `v1.token.websocket.jupyter.org.${encodeURIComponent(token)}`,
  ]
)
```

If a websocket connection with the subprotocol scheme fails, clients MAY retry connections with an older scheme for backward-compatibility, such as sending the token in the `token` URL parameter.

### Servers

Servers SHALL accept API tokens in the `Sec-Websocket-Protocol` header for websocket requests.
The header SHALL have the form:

```
Sec-WebSocket-Protocol: v1.token.websocket.jupyter.org, v1.token.websocket.jupyter.org.{url_token}
```

where `{url_token}` is the url-encoded API token (note: in ~all cases in practice, `token == url_token`)

If a subprotocol matching `v1.token.websocket.jupyter.org.{url_token}` is found:

- `url_token` SHALL be extracted and url-decoded (e.g. `token = unquote('{url_token}')`)
- `token` SHALL be handled identically to if it were sent via `Authorization: Bearer {token}`
- If `token` is invalid or rejected, connection request MUST fail with status 403.
- If `token` is accepted, response MUST include first supported subprotocol in `Sec-WebSocket-Protocol` header.
- If this scheme is supported, `v1.token.websocket.jupyter.org` MUST be a supported subprotocol UNLESS another subprotocol is REQUIRED.
- `v1.token.websocket.jupyter.org` subprotocol MUST NOT be accepted if token is not present or not accepted.

For backward-compatibility, servers:

- SHALL continue to accept tokens in URL parameters and Authorization header,
- SHALL accept empty subprotocols

For enhanced security without backward-compatibility, servers:

- MAY ignore `token` in URL parameters

#### Example implementation

A draft implementation is submitted [to jupyter-server](https://github.com/jupyter-server/jupyter_server/pull/1407).

## Rationale and alternatives

### Following kubernetes example

This JEP follows a scheme [devised by Kubernetes](https://github.com/kubernetes/kubernetes/commit/714f97d7baf4975ad3aa47735a868a81a984d1f0).

Our scheme differs from kubernetes only in that we do not serialize the token via base64 in the header.

Pro base64-encoding:

- eliminates restriction on token values

Con base64-encoding:

- properly url-safe base64 is not consistently implemented across languages (e.g. javascript `base64url` doesn't add padding, but Python `urlsafe_b64decode` requires it)
- increases length of tokens in headers by 33%
- API tokens _are_ specified as text, so no need to handle the full _binary_ space covered by base64

Pro url-quoting (this proposal):

- Equivalent to no encoding for ~all existing tokens
- Shorter in general
- More consistent implementations
- Still accepts all existing valid API tokens

### Other mechanisms

There are [other discussions](https://websockets.readthedocs.io/en/stable/topics/authentication.html#sending-credentials) of websocket authentication, which include handling authentication in a first message.

Sending the token in a message has the following downsides, specifically regarding transition and backward-compatibility:

For servers:

- The server would need to accept all connections without authentication and implement timeout logic to close connections that never authenticate (a potential Denial-of-Service issue, but not insurmountable)
- The 'on message' behavior on the server becomes stateful because the first message must be authentication and then enter the current state
- If we want to accept both the old and new handshake (and we should, at least for a long transition period), it is even more complex. One way could be to accept them at different URLs.

For clients:

- Sending the new handshake to a server that doesn't recognize it would result in errors
- There is no clear mechanism to 'try' the new handshake and fallback on the old
- The client Websocket also needs to be more stateful in terms of changing onmessage/etc. handlers based on phases

The subprotocols strategy is easier for both clients and servers because:

- the negotiation happens in the connection stage, just like now; there is no 'open but not yet authenticated' state
- backward-compatibility on the server side requires no work at all
- backward-compatibility on the client side only requires trying with the subprotocol, then retrying failed connections without, which JupyterLab already does for the kernels subprotocol (it may become slightly more complex to negotiate both optional subprotocols).

Most of these downsides wouldn't exist if we didn't care about backward-compatibility and smooth transitions.
So it's not strictly that the proposed scheme is better, but that it is _easier to transition smoothly to_, given what we are already doing.

### Not doing this

We've gotten along fine, and could consider not doing this at all, keeping websockets authenticated with a URL parameter.
We do get occasional reports that sending the token in the URL violates [CWE-598](https://cwe.mitre.org/data/definitions/598.html).
It's not the biggest problem, but transitioning to this new scheme is low-impact enough that I think it's worth it.

### Questions and answers

> Do we have constraints on token size? For example, is it possible for a Jupyter deployment to have tokens that somehow change based on the user's username and if the user has a very long username, could that token get long enough to hit up against some size limitation on the headers?

This proposal does not change anything here, as we are already setting API tokens in `Authorization` headers.
This only sends the same token in a different header on different requests with ~50 more bytes.

## Prior art

This JEP follows a scheme [used in production by Kubernetes](https://github.com/kubernetes/kubernetes/commit/714f97d7baf4975ad3aa47735a868a81a984d1f0).

## Unresolved questions

- Feature discovery: is suggesting retry enough, or should there be another mechanism by which the availability of this auth scheme is discoverable before trying to connect?

## Future possibilities

It would be reasonable to deprecate/reject tokens in URLs once adoption of this scheme can be assumed.
There is little priority/pressure to do this, but it could be opt-in for more strict deployments.
