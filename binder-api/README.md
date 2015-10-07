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

* Front end developers developing against the API (e.g. [Thebe](https://github.com/oreillymedia/thebe) and associated contexts)
* Operators (e.g. [codeneuro](http://notebooks.codeneuro.org/), [try.jupyter.org](https://try.jupyter.org), [mybinder](http://mybinder.org))
* Users (consuming Jupyter kernels as developers, readers, scientists, researchers)

There are four main actions:

* `build` - build an image from the contents of a GitHub repository (or possibly some other specification)
* `register` - register one or more images as a template for deployment, including specifying any additional services, and resource allocation
* `deploy` - deploys a named template, and provides status about running application from that template
* `pool` - pre-allocate and view details about current pools of running applications

The four resources that support these actions are:

* `builds`
* `templates`
* `applications`
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


## Register templates

We register templates by providing an image and a set of computing resources, as well as possible add-on services. This lets us either use an image we have already built from a repository (in the `build` step), or use an image that we've whitelisted (e.g. a known image we want to make available for a large-scale `thebe` deployment).

Register a template for a named image (plus its configuration)

```
POST /templates HTTP 1.1
Content-Type: application/json
Authorization: 8a5b42ef54ceafe6af87e5

{
  "image-name": "image-name",
  "limits":
    {
      "memory": "...",
      "cpu": "..."
    },
  "command": "ipython notebook --no-browser --allow-origin='*' --NotebookApp.base_url={base_path} --ip=0.0.0.0 ",
  "cull-timeout": 3600,
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
    "name": "template-name",
    "time-created": "2015-10-04T22:20:25.953360391Z",
    "time-modified": "2015-10-04T22:20:25.953360391Z",
}
```

Get info on a template


```
GET /templates/{template-name} HTTP 1.1
Authorization: 8a5b42ef54ceafe6af87e5
```

```
{
  "name": "template-name",
  "image-name": "image-name",
  "image-source": "url on dockerhub" | "url on alternate registry"
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
   ],
  "time-created": "2015-10-04T22:20:25.953360391Z",
  "time-modified": "2015-10-04T22:20:25.953360391Z"
}
```

Get status on a template

```
GET /templates/{template-name}/status HTTP 1.1
Authorization: 8a5b42ef54ceafe6af87e5
```
```
{
  "status": "completed" | "pending" | "failed"
}
```

## Deploy

Once a template is regsitered, we can deploy it as an on-demand application (including a container + services + resources)

Launch a single application

```
POST /applications/{template-name} HTTP 1.1
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

Get info on a running application

```
GET /applications/{template-name}/{id}
```

*returns*

```
{
  "location": "/user/iASaZmxNijCx",
  "id": "12345"
}
```

Get info on all running servers for a named template

```
GET /applications/{template-name} HTTP 1.1
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
GET /pools/{template-name} HTTP 1.1
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
POST /pools/{template-name}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219

{
  "size": 512
}
```

Delete a pool

```
DELETE /pools/{template-name}
Authorization: 9f66083738d8e8fa48e2f19d4bd3bdb4821fa2d3fdc7d84e4228ded5e219
```

## Draft implementation

We imagine the following set of repositories to implement the API. By breaking it up into separate components, it will be easier to iterate them, and also run only subsets (e.g. only the build server, or only register + deploy). Most of these correspond to a individual server, several of which could be managed for local deployments using `docker-compose` (or in another fashion for cloud deployments).

`binder-build`

- runs the build server
- builds images from repos
- can trigger a staging after image build
- puts images on a registry
- a config for the build server specifies the registry
- will stay in python (based on the current version)

`binder-registry`

- registers an environment template (image + spec + config)
- can submit a image along with a configuration

`binder-launch`

- handles both setting up pooling and routes users
- relies on a running binder registry
- config specifies both the binder registry and private docker registery
- default docker registry is dockerhub

`binder-launch-swarm`

- implement the launch process for docker swarm

`binder-launch-kubernetes`

- implement the launch process for kubernetes

`binder-cli`

- command-line utility for interacting with different components
- example usage:

```
binder build --repo
binder register --image --binder-registry --api-key
binder launch --template
```

`binder-logs`

- log image builds
- log deployments

`binder-db`

- store registry of templates
- store running applications

## Use Cases

The following narratives apply the proposed API to the use cases documented in the [kernel gateway incubator proposal](https://github.com/jupyter-incubator/proposals/blob/master/kernel_gateway/proposal.md). Within these narratives:

* *Binder* refers to an implementation of both this API spec and an assumed user interface that exposes some of the function declared in the API
* *Thebe* refers to a version of [oreillymedia/thebe](https://github.com/oreillymedia/thebe) that has been updated to work with Binder and Jupyter protocol 5.0+
* *Kernel Gateway* refers to a headless implementation of the `/api/kernels` from Jupyter Notebook 4.x+, particularly the websocket-to-0mq proxy layer (e.g., [rgbkrk/juno](https://github.com/rgbkrk/juno), [rgbkrk/kernel-service](https://github.com/rgbkrk/kernels-service), [parente/kernel_gateway#wip](https://github.com/parente/kernel_gateway/tree/wip)).

### Use Case #1: Simple, Static Web Apps w/ Modifiable Code

Alice has a scientific computing blog. In her posts, Alice often includes snippets of code demonstrating concepts in languages like R and Python. She sometimes writes these snippets inline in Markdown code blocks. Other times, she embeds GitHub gists containing her code. To date, her readers can view these snippets on her blog, clone her gists to edit them, and copy/paste other code for their own purposes.

Having heard about Thebe and Binder, Alice is interested in making her code snippets executable and editable by her readers. She adds a bit of JavaScript code on her blog to include the Thebe JS library, and turn her code blocks into edit areas with *Run* buttons.

Alice them visits the web site of a publicly addressable Binder instance (hosted by the good graces of the community). She browses the image templates available on the site to see if there is one suiting her blog post code requirements. She finds one, `jupyter-scipy-kernel`, with the following properties satisfying her Python post requirements.

* Kernel gateway
* IPython kernel on Python 3.x
* ipywidgets, matplotlib, seaborn, scipy, pandas, statsmodels, and numpy within the container

And another, `jupyter-r-kernel`, for her typical R posts:

* Kernel gateway
* IRkernel on R 3.x
* ggplot2, forecast, randomforest and a few other libs within the container

She writes a bit of JS to configure Thebe to request the proper template on each page of her blog.

When Bob visits Alice's blog, his browser loads the markup and JS for her latest post. On page load, the JS uses Thebe to request a new deployment of the configured template from Binder. Binder spawns it and returns its ID to the requesting in-browser JS client. Thebe polls until the response also contains a location URL for the spawned template. Thebe establishes a websocket connection to that location. The spawned template exists as long as Bob remains on the page.

Under the covers, the launched application is container running a kernel gateway acting as a websocket-to-0mq bridge for a kernel running within the same container. Binder maps this the websocket port to a route in a front proxy for external client access.

### Use Case #2: Notebooks Converted to Standalone Dashboard Applications

Cathy uses Jupyter Notebook in her role as a data scientist at ACME Corp. She writes notebooks to munge data, create models, evaluate models, visualize results, and generate reports for internal stakeholders. Sometimes, her work informs the creation of dashboard web applications that allow other users to explore and interact with her results. In these scenarios, Cathy is faced with the task of rewriting her notebook(s) in the form of a traditional web application. Cathy would love to avoid this costly rewrite step.

One day, Cathy deploys Binder to the same compute cluster where she authors her Jupyter notebooks. She builds a set of container images including her commonly used kernels, libaries, and other backend dependencies. She then defines templates for launching these images and registers them with the Binder CLI.

The next time Cathy needs to build a web app, she creates a new notebook that includes interactive widgets, uses Jupyter extensions to position the widgets in a dashboard-like layout, and transforms the notebook into a standalone NodeJS web app. Cathy deploys this web app to ACME Corp's internal web hosting platform, and configures it with the Binder URL, credentials, and appropriate image template name.

Cathy sends the URL of her running dashboard to David, a colleague from the ACME marketing department. When David visits the URL, the application prompts for his intranet credentials. After login, his browser loads the markup and JS for the frontend of the dashboard web app. The JS contacts Binder to launch an instance of the configured template, establishes a websocket to it (see above), and sends all of the code from the original notebook to the kernel backend for execution at once. The output responses from the kernel are rendered into the dashboard web page in Cathy's previously defined dashboard layout.

### Use Case #3: Notebook Authoring Separated from Kernel/Compute Clusters

Erin is a Jupyter Notebook and Spark user. She would like to pay a third-party provider for a hosted compute plus data storage solution, and drive Spark jobs on it using her local Jupyter Notebook server as the authoring environment.

In a bright and not-so-distant future, Erin chooses a Spark provider that provides a Binder API. Her provider allows Erin to upload her own container images and define her own Binder templates using them. Erin uses this ability to create a handful of container images that include a Jupyter kernel, a Jupyter kernel gateway, and various scientific computing libraries. Erin then configures her local Jupyter Notebook server with the URL of her Binder provider and credentials for accessing its API.

Erin fires up her local Notebook server. In the *New* dropdown, she sees the names of her remote Binder kernel templates fetched from her provider. When Erin clicks one, her Notebook server does the work of requesting an instance from the Binder API. Once available, her Notebook server conveys the location of the launched container to her Notebook frontend code. The frontend code establishes a websocket connection to the kernel gateway running within the launched container. Thereafter, interaction between the Notebook frontend and kernel gateway proceeds as if the kernel were launched locally and the Notebook server itself was acting as the gateway (i.e., how Jupyter Notebook works today).

When Frank, a colleague of Erin, learns about her great setup, he asks to share her compute provider account and make it a team account. Happy to help, Erin does so. Frank then spins up a VM in his current cloud provider, runs Jupyter Notebook server on it, and points it to the Binder API in the same manner that Erin did.

## Interested Collaborators

* [Kyle Kelley (@rgbkrk)](https://github.com/rgbkrk)
* [Jeremy Freeman (@freeman-lab)](https://github.com/freeman-lab)
* [Andrew Osheroff (@andrewosh)](https://github.com/andrewosh)
* [Safia Abdalla @captainsafia](https://github.com/captainsafia)
* [Peter Parente (@parente)](https://github.com/parente)
* [Tim Head (@betatim)](https://github.com/betatim)
* [Karissa McKelvey (@karissa)](https://github.com/karissa)
* [Max Ogden (@maxogden)](https://github.com/maxogden)
