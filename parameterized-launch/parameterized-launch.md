# Parameterized Kernel Launch

This proposal is rooted in the [jupyter_kernel_mgmt](https://github.com/takluyver/jupyter_kernel_mgmt) repo because it relies on the Kernel Provider model introduced in this library.  As a result, it is dependent upon the acceptance of [JEP #45](https://github.com/jupyter/enhancement-proposals/pull/45). In addition, the proposal (optionally) affects other repositories, namely [jupyter_server](https://github.com/jupyter/jupyter_server), [jupyterlab](https://github.com/jupyterlab/jupyterlab), [notebook](https://github.com/jupyter/notebook), [voila](https://github.com/voila-dashboards/voila) and any other client-facing applications that launch kernels once jupyter_server is adopted as the primary backend server. 

This proposal formalizes the [changes that introduced launch parameters](https://github.com/takluyver/jupyter_kernel_mgmt/pull/22) by defining kernel launch parameter metadata and how it is to be returned from kernel providers and interpreted by client applications.  This feature is known as _Parameterized Kernel Launch_ (a.k.a _Parameterized Kernels_).  It includes 'launch' because many of the parameters really apply to the _context_ in which the kernel will run and are not actual parameters to the kernel.  Things like memory, cpus, and gpus are examples of "contextual" parameters.  This proposal was [originally posted as an issue](https://github.com/takluyver/jupyter_kernel_mgmt/issues/38) in jupyter_kernel_mgmt, but has since been trasitioned to this enhancement proposal.  Please note that I have added some content since the original issue was posted.



## Launch Parameter Schema
The set of available launch parameters for a given kernel will be conveyed from the server to the client application via the _kernel type_ information (formerly known as the kernelspec) as JSON returned from the `/api/kernelspecs` REST endpoint.  When available, launch parameter metadata will be included within the existing `metadata` stanza under `launch_parameter_schema`, and will consist of JSON schema that describes each available parameter.  Because this is pure JSON schema, this information can convey required values, default values, choice lists, etc. and be easily consumed by applications.  (Although I'd prefer to avoid this, we could introduce a custom schema if we find the generic schema metadata is not sufficient.)

```json
   "metadata": {
       "launch_parameter_schema": {
         "$schema": "http://json-schema.org/draft-07/schema#",
         "title": "Available parameters for kernel type 'Spark - Scala (Kubernetes)'",
         "properties": {
           "cpus": {"type": "number", "minimum": 0.5, "maximum": 8.0, "default": 4.0, "description": "The number of CPUs to use for this kernel"},
           "memory": {"type": "integer", "minimum": 2, "maximum": 1024, "default": 8, "description": "The number of GB to reserve for memory for this kernel"}
         },
         "required": ["cpus"]
       }
    }
```
Because the population of the `metadata.launch_parameter_schema` entry is a function of the _kernel provider_[1], how the provider determines what to include is an implementation detail.  The requirement is that `metadata.launch_parameter_schema` contain valid JSON schema.  However, since nearly 100% of kernels today are based on kernelspec information located in kernel.json, this proposal will also address how the `KernelSpecProvider` goes about composing `metadata.launch_parameter_schema` and acting on the returned parameter values.

## KernelSpecProvider Schema Population
I believe we should support two forms of population, referential and embedded, both of which can be used simultaneously.
### Referential Schema Population
Referential schema population is intended for launch parameters that are shared across kernel configurations, typically the aforementioned "contextual" parameters.  When the `KernelSpecProvider` loads the kernel.json file, it will look for a key under `metadata` named `launch_parameter_schema_file`.  If the key exists and its value is an existing file, that file's contents will be loaded into a dictionary object.  
### Embedded Schema Population
Once the referential population step has taken place, the `KernelSpecProvider` will check if `metadata.launch_parameter_schema` exists and contains a value.  If so, the KernelSpecProvider will load that value, then update the dictionary resulting from the referential population step.  This allows _per-kernel_ parameter information to override the shared parameter information.  For example, some kernel types may require more cpus that aren't generally available to all kernel types.

`KernelSpecProvider` will then use the merged dictionaries from the two population steps as the value for `metadata.launch_parameter_schema` that is returned from its `find_kernels()` method and, ultimately, the `/api/kernelspecs` REST API.  Any entry for `metadata.launch_parameter_schema_file` will not appear in the returned payload.

## Client Applications
_Parameter-aware_ applications that retrieve kernel type information from `/api/kernelspecs` will recognize the existence of any `metadata.launch_parameter_schema` values.  When a kernel type is selected and contains launch parameter schema information, the application should construct a dialog from the schema that prompts for parameter values.  Required values should be noted and default values should be pre-filled.  (We will need to emphasize that all required values have reasonable defaults, but how that is handled is more a function of the kernel provider.)

Once the application has obtained the desired set of parameters, it will create an entry in the JSON body of the `/api/kernels` POST request that is a dictionary of name/value pairs.  The key under which this set of pairs resides will be named `launch_params`.  The kernels handler will then pass this dictionary to the framework, where the kernel provider launch method will act on it.

```json
   "launch_params": {
       "cpus": 4,
       "memory": 512
    }
```

Note that applications that are unaware of `launch_parameter_schema` will still behave in a reasonable manner provided the kernel provider applies reasonable default values to any required parameters.

In addition, it would be beneficial if the set of parameter name/value pairs could be added into the notebook metadata so that subsequent launch attempts could use _those_ values in the pre-filled dialog.

## Kernel Provider Launch
Once the kernel provider launch method is called, the provider should validate the parameters and their values against the schema.  Any validation errors should result in a failure to launch - although the decision to fail the launch will be a function of the kernel provider.  The provider will need to differentiate between "contextual" parameters and actual kernel parameters and apply the values appropriately.  `jupyter_kernel_mgmt` will likely provide a helper method for validation.

Note: Since KernelSpecProvider will be the primary provider, at least initially, applications that wish to take advantage kernel launch parameters may want to create their own providers.  Fortunately, we've provided a mechanism whereby KernelSpecProvider can be extended such that much of the discovery and launch machinery can be reused.  In these cases, the kernel.json file would need to be prefixed with the new provider id so that `KernelSpecProvider` doesn't include those same kernel types in its set. 

## Environment Variables
A common mechanism in use today to vary a kernel's launch behavior utilizes environment variables.  These variables are conveyed to the launch mechanism and set into the kernel's environment when launched.  Since environment variables are commonly used in containerized contexts, we may want to support the ability for their specification within this mechanism.  There are a few options to distinguish these kinds of parameters from "contextual" and kernel-specific parameters, if at all (option 4).

1. Use a custom schema that defines a `is_env` meta-property.  Schema entries with `is_env=True` will be set into the kernel's environment.  I'd prefer to avoid a custom schema since it would require access to its definition and introduces more deployment/configuration issues.
2. Create an explicit sub-section in `launch_parameter_schema` named `env_variables` that define the metadata corresponding to environmental variables.  The payload on the subsequent POST request (to start a kernel) would then also include an `env_variables` sub-section consisting of the name/value pairs that the kernel provider ensures are placed into the target kernel's environment.
3. Have an implicit rule that parameter names that are completely capitalized (with underscores: `[A-Z][A-Z_]*`) are treated as environment variables.
4. Do nothing.  The kernel provider will know which parameters correspond to environment variables, "contextual" variables or kernel-specific parameters.  This approach implies that the client-facing application doesn't need to expose a given parameter as an environmental variable - which, technically, is just an implementation detail anyway.

Note: where option 4 breaks down is for kernel providers that are generically written.  For example `KernelSpecProvider` will be the provider for 90% of kernels.  Should _it_ be the entity that knows a given parameter should be interpreted as an environment variable?  As a result, a more explicit mechanism as proposed in the first 3 options is probably warranted.


## Virtual Kernel Types
One of the advantages of kernel launch parameters is that one could conceivably have a single kernel configured, yet allow for a plethora of configuration options based on the parameter values - as @rgbkrk points out [here](https://github.com/takluyver/jupyter_kernel_mgmt/issues/9#issuecomment-496434455) - since this facility essentially _fabricates_ kernel types that, today, would require a separate type for each set of options.

## Backwards Compatibility
Parameter-aware applications that are receiving results from the `/api/kernelspecs` REST API must be able to tolerate the _non-existence_ of `metadata.launch_parameter_schema` within the kernelspec results.  Likewise, parameter-unaware applications will need to ignore the parameter stanza - which is the case today.  

Kernel providers that support parameterized launches must also handle required parameters by providing reasonable defaults.  In addition, they must not assume that the application will provide those defaults - despite the fact that the schema for those required parameters define default values - since the application that is requesting the kernel start (via the POST on `/api/kernels`) may be unaware of this parameter mechanism.

## References
https://github.com/takluyver/jupyter_kernel_mgmt/pull/22
https://github.com/jupyter/jupyter_client/issues/434
https://github.com/jupyter/enterprise_gateway/issues/640
https://paper.dropbox.com/doc/Day-1-Kernels-jupyter_client-IPython-Notebook-server--ApyJEjYtqrjfoPg1QpbxZfcpAg-MyS7d8X4wkkhRQy7wClXY
https://github.com/takluyver/jupyter_kernel_mgmt/issues/9

[1]: _Kernel Provider_ is a term introduced by the proposed [Jupyter Kernel Management](https://github.com/jupyter/enhancement-proposals/pull/45) package which enables the ability for third-party applications to bring their own kernel management (and discovery) mechanisms that can co-exist with other third-party applications doing the same thing.  Previously, exactly one override of `KernelManager` (and for discovery, `KernelSpecManager`) could be supported at a time.

