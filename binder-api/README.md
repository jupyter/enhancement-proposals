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

* `bindings` - create a new binding which is a specification/template for a collection of resources
* `binders` - spawn a binder by `bindingID|Name` as specified by the binding template, list currently running binders
* `pools` - pre-allocate and view details about current pools of running binders

Some of these operations should have authorization, depending on their usage.
These are assumed to be run on an API endpoint (e.g. api.mybinder.org) or
potentially with a leading `/api/` path.

## Building binders from bindings

The binding (how a binder is put together) is:

* The environment the user's code runs in
* Services attached to that environment (Spark, Postgres, etc.)

### Creating a new binding

```
POST /bindings/CodeNeuro/notebooks/ HTTP 1.1
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

That's copied straight from the current binder API, so we'll need to flesh this
out.

### Detail on a binding

Performing a `GET` on the binding returns the current declaration of that binding.

```
GET /bindings/CodeNeuro/notebooks/ HTTP 1.1
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

Beyond that, I think a `HEAD` request makes sense here for checking to see if a binding exists.

## Launching a binder

The binder is the instance launched for a user, relying on the collection of
resources already set up as a binder. Since we're creating a container, we'd want to start this off as a `POST` with a `GET` retrieving that same information.

```
POST /binders/CodeNeuro-notebooks/ HTTP 1.1
Accept: application/json
```

Which would return

```
{
  "id": "12345"
}
```

unless the resource is immediately available, in which case the return would
include the `location`.

```
{
  "id": "12345",
  "location": "/user/iASaZmxNijCx"
}
```

Otherwise, retrieving the location for that specific binder would be by `GET`

```
GET /binders/CodeNeuro-notebooks/12345
```

which returns

```
{
  "location": "/user/iASaZmxNijCx",
  "id": "12345"
}
```

With an API key, a GET against the top level resource:

```
GET /binders/CodeNeuro-notebooks/ HTTP 1.1
Authorization: 5c011f6b474ed90761a0c1f8a47957a6f14549507f7929cc139cbf7d5b89
```

Returns all of the current containers that user is allowed to see.

```
[
  {
    "location": "...",
    "id": "12345",
    "uri": "/binders/CodeNeuro-notebooks/12345"
  },
  {
    "location": "...",
    "id": "787234",
    "uri": "/binders/CodeNeuro-notebooks/787234"
  }
]
```

## Working with pools of pre-allocated binders

tmpnb does pooling by default and requires re-launching to change pool size and
running wholly independent pools for launching with alternative images.

To make this simpler (and for happy admins), we create an endpoint at `/pools/` to set up capacities (and inspect allocations) for images:

```
GET /pools/{binderName} HTTP 1.1
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
POST /pools/{binderName}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219

{
  "minPool": 512
}
```

## Interested Collaborators

* [Kyle Kelley (@rgbkrk)](https://github.com/rgbkrk)
* [Jeremy Freeman (@freeman-lab)](https://github.com/freeman-lab)
* [Andrew Osheroff (@andrewosh)](https://github.com/andrewosh)
* [Safia Abdalla @captainsafia](https://github.com/captainsafia)
* [Peter Parente (@parente)](https://github.com/parente)
