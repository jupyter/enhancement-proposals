# API for on-demand environments

## Problem

The temporary notebook system (tmpnb) was put together to solve some immediate
demands, the primary of which were:

* Instantaneous launching of a brand new notebook server
* Fully reproducible environment (installation, code, data, notebooks, etc.)
* Multi-tenant
* Launch as a user hits a URL (no interaction)
* Launch via a simple API (POST to `/api/spawn`), as used by e.g. thebe

In order to make running a multi-tenant service like this simple to operate,
maintain, and extend we need a REST API that assists three classes of users:

* Front end developers developing against the API (e.g. Thebe and associated contexts)
* Operators (e.g. codeneuro, try.jupyter.org, mybinder)
* Users (consuming kernels as developers, readers, scientists, researchers)

There are four main actions:

* `build` - build an image from the contents of a GitHub repository (or possibly some other specification)
* `stage` - make one or more images ready for deployment, including specifying any additional services, and resource allocation
* `deploy` - deploys a named environment, and provides status about running versions of that environment
* `pool` - pre-allocate and view details about current pools of running environments

The four resources that support these actions are:

* `builds`
* `stagings`
* `servers`
* `pools`

Some of these operations should have authorization, depending on their usage.
These are assumed to be run on an API endpoint (e.g. api.mybinder.org) or
potentially with a leading `/api/` path.


## Build images

We build images from GitHub repositories through a `POST` to the `images` resource, by specifying a description of a runtime and its dependencies, and additional resources (e.g. data)

Create an image from a repository

```
POST /builds/repos HTTP 1.1
Content-Type: application/json

{
  "repository": "https://github.com/user/name",
  "dependencies": ["requirements.txt"]
}
```

*returns*

```
{
	"image-name": "image-name"
}
```


Get info on an image

```
GET /builds/repos/{image-name}
```

*returns*


```
{
	"image-name": "image-name",
	"repository": "https://github.com/user/name",
	"dependencies": ["requirements.txt"]
}
```

Get image id for a repository

```
GET /builds/repos?repository="https://github.com/user/name"
```

*returns*

```
{
	"image-name": "image-name"
}
```

Get status on a build

```
GET /builds/repos/{image-name}/status HTTP 1.1
Authorization: 8a5b42ef54ceafe6af87e5
```
```
{
	"status": "completed" | "pending" | "failed"
}
```


## Stage deployments

We stage deployments by providing an image and a set of computing resources, as well as possible add-on services. This lets us either use an image we have already built from a repository (in the `build` step), or use an image that we've whitelisted (e.g. a known image we want to make available for a large-scale `thebe` deployment).

Stage a deployment from a named image.

```
POST /stagings HTTP 1.1
Content-Type: application/json
Authorization: 8a5b42ef54ceafe6af87e5

{
	"image-name": "image-name",
	"limits":
		{
			"memory": "...",
			"cpu": "..."
		}
	"services":
	[
		{
			"name": "spark",
			"version": "1.4.1",
			"params": {
				"heap_mem": "4g",
				"stack_mem": "512m"
			}
		}, ...
 	]
}
```

*returns*

```
{
        "environment-name": "environment-name"
}
```

Get info on a staging


```
GET /stagings/{environment-name} HTTP 1.1
Authorization: 8a5b42ef54ceafe6af87e5
```

```
{
	"image-name": "image-name",
	"limits":
		{
			"memory": "...",
			"cpu": "..."
		}
	"services":
	[
		{
			"name": "spark",
			"version": "1.4.1",
			"params": {
				"heap_mem": "4g",
				"stack_mem": "512m"
			}
		}, ...
 	]
}
```

Get status on a staging

```
GET /stagings/{environment-name}/status HTTP 1.1
Authorization: 8a5b42ef54ceafe6af87e5
```
```
{
	"status": "completed" | "pending" | "failed"
}
```

## Deploy

Once an environment is staged, we can deploy it as an on-demand server.

Launch a single server

```
POST /deployments/{environment-name} HTTP 1.1
Accept: application/json
```

*returns*


```
{
  "id": "12345"
}
```

or if it's already available in a pool

```
{
  "id": "12345",
  "location": "/user/iASaZmxNijCx"
}
```

Get info on a running server

```
GET /deployments/{environment-name}/{id}
```

*returns*

```
{
  "location": "/user/iASaZmxNijCx",
  "id": "12345"
}
```

Get info on all running servers for a named environment

```
GET /deployments/{envirnoment-name} HTTP 1.1
Authorization: 5c011f6b474ed90761a0c1f8a47957a6f14549507f7929cc139cbf7d5b89
```

*returns*

```
[
  {
    "location": "/user/iASaZmxNijCx",
    "id": "12345"
  },
  {
    "location": "/user/iASaZmxNijCx",
    "id": "787234"
  }
]
```
In all of these specifications, `location` is either a URI or a full URL


## Pool

Pools make it easy to deploy large-collections of on-demand servers for immediate use (as tmpnb currently does). This endpoint will make it easy to set up capacities for particular environments, and inspect allocations.

Get information on a pool

```
GET /pools/{environment-name} HTTP 1.1
```
```
{
  "running": 123,
  "available": 12,
  "size": 124
}
```

Get information on all pools with authorization

```
GET /pools/ HTTP 1.1
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219
```
```
{
	{
		"running": 123,
		"available": 12,
		"size": 124
	},
	{
		"running": 2,
		"available": 10,
		"size": 12
	},...
}
```

Create a pool or change the size of a running pool

```
POST /pools/{environment-name}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219

{
  "size": 512
}
```

Delete a pool

```
DELETE /pools/{environment-name}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219
```



## Interested Collaborators

* [Kyle Kelley (@rgbkrk)](https://github.com/rgbkrk)
* [Jeremy Freeman (@freeman-lab)](https://github.com/freeman-lab)
* [Andrew Osheroff (@andrewosh)](https://github.com/andrewosh)
* [Safia Abdalla @captainsafia](https://github.com/captainsafia)
* [Peter Parente (@parente)](https://github.com/parente)
* [Tim Head (@betatim)](https://github.com/betatim)
