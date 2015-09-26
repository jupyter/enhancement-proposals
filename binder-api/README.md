# Binder API

## Problem

The temporary notebook system (tmpnb) was put together to solve some immediate
demands, the primary of which were:

* Instantaneous launching of a brand new notebook server
* Fully reproducible environment (installation, code, data, notebooks, etc.)
* Multi-tenant
* Launch as a user hits a URL (no interaction)
* Launch via a simple API (POST to `/api/spawn`), as used by e.g. thebe

In operating one of the first prototypes for this (jupyter/tmpnb), there is

In order to make running a multi-tenant service like this simple to operate,
maintain, and extend we need a REST API that assists three classes of users:

* Front end developers developing against the API (e.g. Thebe and associated contexts)
* Operators (e.g. codeneuro, try.jupyter.org, mybinder)
* Users (consuming kernels as developers, readers, scientists, researchers)

There are three main resources for a REST API

* `binders` - create a new binder which is a specification/template for a collection of resources
* `containers` - spawn containers by `binderID|Name`, list currently running containers
* `pools` - pre-allocate and view details about current pools of running binder containers

Some of these operations should have authorization, depending on their usage.

## Building a binder image

This is used at the API endpoint (e.g. api.mybinder.org) to work with binder image resources.

### Creating a new binder

```
POST /binders/CodeNeuro/notebooks/ HTTP 1.1
Content-Type: application/json

{
  "name": "codeneuro-notebooks",
  "repo": "https://github.com/CodeNeuro/notebooks",
  "requirements": "repo/requirements.txt",
  "notebooks": "repo/notebooks",
  "services": [
    {
      "name": "spark",
      "version": "1.4.1",
      "params": {
        "heap_mem": "4g",
        "stack_mem": "512m"
      }
    }
  ]
}
```

That's copied straight from your current API, though it would be good to spec those out.

### Detail on a binder

Right now the `GET` on `/apps/<organization>/<repo>/` returns the redirect URI (yes, tmpnb does this too because of its limited purpose, but they're already launched).

In my opinion this should tell you about the resource, returning what the spec was in the `POST` as well as the status.

```
GET /binders/CodeNeuro/notebooks/ HTTP 1.1
```

would then return

```
{
  "name": "codeneuro-notebooks",
  "repo": "https://github.com/CodeNeuro/notebooks",
  "requirements": "repo/requirements.txt",
  "notebooks": "repo/notebooks",
  "services": [
    {
      "name": "spark",
      "version": "1.4.1",
      "params": {
        "heap_mem": "4g",
        "stack_mem": "512m"
      }
    }
  ]
}
```

That could include that status as well.

Beyond that, I think a `HEAD` request makes sense here for checking to see if a binder exists.


## Launching a binder

Right now this is part of the `GithubBuildHandler` as a GET on the `/apps/` resource. This piece could actually be distant from GitHub, relying only on image names (those that have been built, whitelisted, whatever). In the [Docker API](https://docs.docker.com/reference/api/docker_remote_api_v1.20/#create-a-container) (just as a reference), they `POST to /containers/create` with the payload.

Since we're talking "precanned" images (in the sense they were built prior or already existing) that get launched either by a user visiting a resource or via AJAX call by JavaScript, I think we can pick a solid resource name. ~~I'm tilted towards `spawn` since it's a noun and we've already been using it in tmpnb.~~ Picked `containers` after discussion on gitter.

Since we're creating a container, we'd want to start this off as a `POST` with a `GET` retrieving that same information.

```
POST /containers/CodeNeuro-notebooks/ HTTP 1.1
Accept: application/json
```

Which would return

```
{
  "id": "12345"
}
```

If the resource was immediately available, then it could include the `location`. Otherwise, retrieving the location for that specific container would be by `GET`

```
GET /containers/CodeNeuro-notebooks/12345
```

which returns

```
{
  "location": "...",
  "id": "12345"
}
```

You may ask yourself then, what if someone GETs the resource directly?

```
GET /containers/CodeNeuro-notebooks/ HTTP 1.1
Authorization: 5c011f6b474ed90761a0c1f8a47957a6f14549507f7929cc139cbf7d5b89
```

This *should* return all of the current containers that user is allowed to see.

```
[
  {
    "location": "...",
    "id": "12345",
    "uri": "/containers/CodeNeuro-notebooks/12345"
  },
  {
    "location": "...",
    "id": "787234",
    "uri": "/containers/CodeNeuro-notebooks/787234"
  }
]
```

The last thing I posted, about returning all the currently spawned containers, would be *super helpful* for operations (as I've faced with tmpnb). It's probably worth thinking about authentication sooner rather than later, even if for your own administration.

It's easy to defer to a separate authentication store, relying on an LRU key store (that's what I made https://github.com/rgbkrk/lru-key-store for, when deferring to a separate identity service) to keep yourself from making repeated calls to, e.g. GitHub or another provider.



## Working with pools of pre-allocated binders

Thinking about the pooling that tmpnb does (and that I would hope for in binder), I imagine we could have an endpoint at `/pool/` to set up capacities (and inspect allocations) for images:

```
GET /pool/{imageName} HTTP 1.1
```

returns

```json
{
  "running": 123,
  "available": 12,
  "minPool": 1
}
```

Updating the pool (by `POST` or `PUT`):

```
POST /pool/{imageName}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219

{
  "minPool": 512
}
```
