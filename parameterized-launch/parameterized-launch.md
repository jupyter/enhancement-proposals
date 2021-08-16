# Parameterized Kernel Launch

With the introduction of [_Kernel Provisioners_](https://jupyter-client.readthedocs.io/en/latest/provisioning.html) in the upcoming jupyter_client 7.0 release, we now have a means by which a kernel's runtime environment can be easily configured.  This is because the kernel provisioner is the entity most knowledgeable about _where_ and _how_ a given kernel will run.

This feature is known as _Parameterized Kernel Launch_ (a.k.a _Parameterized Kernels_).  It includes 'launch' because many of the parameters really apply to the _context_ in which the kernel will run and are not actual parameters to the kernel.  Things like memory, cpus, and gpus are examples of "provisioner" parameters.

This proposal formalizes how kernel parameterization is expressed via the kernel specification, how it is derived from the kernel provisioner, and acted upon by client applications. 

Because kernel provisioners are essentially kernel-agnostic, there are _two_ sets of parameters we should address in this proposal: _provisioner parameters_ and _kernel parameters_.  Provisioner parameters are known to the kernel provisioner and influence the kernel's runtime environment, while kernel parameters are specific to the kernel and typically influence its behavior.

## Provisioner and Kernel Parameter Schemas
Both sets of parameters (provisioner and kernel) relative to a given kernel will be conveyed from the server to the client application via the kernel specification (a.k.a. the kernelspec).  This information will be expressed as JSON schema returned from the `/api/kernelspecs` REST endpoint or from the `KernelSpecManager` directly (for command-line based applications).

When available, parameter metadata will be included within the existing `metadata` stanza of the kernelspec (`kernel.json`) file.  Provisioner parameters schema will be located within the `kernel_provisioner` stanza in `provisioner_parameter_schema`, while kernel-specific parameters will be located within a `kernel_parameter_schema` stanza directly within the `metadata` stanza. These stanzas will consist of JSON schema that describe each available parameter.  Because this is pure JSON schema, this information can convey required values, default values, choice lists, etc. and be easily consumed by applications.  (Although I'd prefer to avoid this, we _could_ introduce a custom schema if we find the generic schema metadata is not sufficient.)

Here's an example of a possible `kernel.json`'s metadata stanza...
```JSON
"metadata": {
   "kernel_provisioner": {
        "name": "spark-provisioner",
        "config": {
            "host_endpoint": "https://acme.com/spark-cluster:7777"
        },
        "provisioner_parameter_schema": {
            "title": "Spark Provisioner Parameters",
            "properties": {
                "provisioner_parameters": {
                    "type": "object",
                    "properties": {
                        "cpus": {"type": "number", "minimum": 0.5, "maximum": 8.0, "default": 4.0, "description": "The number of CPUs to use for this kernel"},
                        "memory": {"type": "integer", "minimum": 2, "maximum": 1024, "default": 8, "description": "The number of GB to reserve for memory for this kernel"}
                    }
                }
            }
            "required": ["cpus"]
        }
    },
    "kernel_parameter_schema": {
        "title": "IPyKernel Parameters",
        "type": "object",
        "properties": {
            "kernel_parameters": {
               "type": "object",
                "properties": {
                      "cache_size": {"type": "integer", "description": "Set the size of the output cache", "default": 1000, "minimum": 0, "maximum": 50000},
                      "matplotlib": {"type": "string", "default": "auto", "enum": ["auto", "agg", "gtk", "gtk3", "inline", "ipympl", "nbagg", "notebook", "osx", "pdf", "ps", "qt", "qt4", "qt5", "svg", "tk", "widget", "wx"], "description": "Configure matplotlib for interactive use with the default matplotlib"}
                }
            }
        }
    }
}
```

### Provisioner Parameter Schema
Because the population of the `metadata.kernel_provisioner.provisioner_parameter_schema` entry is a function of the _kernel provisioner_, how the provisioner determines what to include as its parameter schema is specific to that provisioner.  The requirement is that `metadata.kernel_provisioner.provisioner_parameter_schema` contain valid JSON schema.  However, since 100% of kernels today are based on kernelspec information located in `kernel.json`, this proposal will also address how the `KernelSpecManager` goes about composing `metadata.kernel_provisioner.provisioner_parameter_schema` and acting on the returned parameter values.

#### KernelSpec Schema Population
It's important that parameter definitions be both easy to use and flexible to configure.  As a result, there should be multiple sources of parameter schema with differing orders of precedence.  This proposal introduces three sources of schema population not all of which are necessary.

The KernelSpecManager will coordinate the accumulation of provisioner parameters and populate the returned kernelspec with the result, taking orders of precedence into account.

##### Embedded Schema
Embedded schema population is when then the parameter schema is included directly in the `kernel.json` file.  For example, the contents of the `kernel.json` would closely resemble the example above.  With embedded schema, the administrator has the ability to influence default values, enumerations, etc.  Schema defined at this location will always take precedence over other sources of parameter schema.

##### Referential Schema
A second form of population that could be supported is referential schema population in which a reference to a file is provided and that file is then used as a basis on which the embedded schema is applied.  The file reference would be conveyed as a sibling attribute to `provisioner_parameter_schema` named `provisioner_parameter_schema_file`, whose value is a path (absolute or relative) to a file containing the parameter schema.

An advantage of referential schema population is that it could serve to define which parameters should be displayed by the client application - assuming that packaged population (see next) is not used.

A second advantage is that a site administrator could configure the parameters across a number of kernel specifications that utilize the same provisioner with overrides defined via embedded population.

##### Packaged Schema
Packaged schema population is when the parameter schema is obtained directly from the Kernel Provisioner itself.  This form of population requires that the provisioner implement a static function `get_parameter_schema()` which returns a dictionary of schema entries defining each parameter.  These parameter definitions are essentially "factory settings" on which the provisioner was implmented.  The `KernelSpecManager` will be responsible for retrieving this information and merging it with any embedded schema that might exist.  Since embedded and referential population forms take precedence, the output of `get_parameter_schema()` will serve as the basis, and the other populations will be applied to it.

Some observations of the above population schemes:
1. If _packaged population_ is to be used, we should probably define the ability to hide parameters since it represents the complete set of supported parameters.  This will likely introduce a schema _meta-property_ like `is_hidden` - which then implies kernel provisioning may want its own schema definition.  If we decide to have our own schema definition, any additions should be defined in and exposed va `KernelProvisionerFactory`.
2. A provisioner can have its own configuration in which an administrator can define its set of _exposed parameters_ thereby removing the need for a `is_hidden` meta-property.  The result of calling `get_parameter_schema()` would utilize such a configuration setting, returning the schema of only exposed parameters.
3. We should probably have each provisioner implement a form of `get_parameter_schema()` regardless of whether packaged population is used, solely for the tooling and a _source of truth_.

### Kernel Parameter Schema
Variants for how kernel parameter schema is populated are far fewer, consisting solely of _embedded population_.  (Note: we _could_ use a referential form here as well - probably worth discussing.)  In addition, the manner in which these parameters are used must be generic across all kernels since provisioners are kernel-agnostic.

Today, kernel-specific parameters must be conveyed as templated variables in the `kernel.json` `argv:` stanza.  These values are substituted when the `KernelManager`, now via the `KernelProvisioner`, formats the command.  As a result, the kernel provisioner will be responsible for taking the applicable kernel-specific parameter values and applying them to the argument vector.  Since any kernel-specific parameters not reflected as templated values in the `argv:` stanza will be ignored, it is the administrator's responsibility to ensure the `argv:` stanza is properly templated.

### Environment Variables
A common mechanism in use today to vary a kernel's launch behavior utilizes environment variables.  These variables are conveyed to the launch mechanism and set into the kernel's environment when launched.  Since environment variables are commonly used in containerized contexts, we should support the ability for their specification within this framework.

This proposal will adopt the convention that environment variables can be specific to both kernels and provisioners.  However,  because both are applied in the same manner, the provisioner will be responsible for gathering environment variables and ensuring their _deployment_ into the kernel's environment.  Rather than intersperse environment variables amongst parameters, each parameter schema will define an object-valued property named `environment_variables` that specifies the recognized environment variables for the kernel or provisioner.  In addition, this schema should allow for additional properties (i.e., additional environment variables) since we typically find other integrations that the kernel and provisioner may be interacting with require their own environment variables.

Here's an example of such a `kernel.json` file in which environment variable schemas are specified...
```JSON
"metadata": {
   "kernel_provisioner": {
        "name": "spark-provisioner",
        "config": {
            "host_endpoint": "https://acme.com/spark-cluster:7777"
        },
        "provisioner_parameter_schema": {
            "title": "Spark Provisioner Parameters",
            "properties": {
                "provisioner_parameters": {
                    "type": "object",
                    "properties": {
                        "cpus": {"type": "number", "minimum": 0.5, "maximum": 8.0, "default": 4.0, "description": "The number of CPUs to use for this kernel"},
                        "memory": {"type": "integer", "minimum": 2, "maximum": 1024, "default": 8, "description": "The number of GB to reserve for memory for this kernel"}
                    },
                    "environment_variables": {
                        "type": "object",
                        "properties": {
                            "PROVISIONER_ENV_A": {"type": "string"},
                            "PROVISIONER_ENV_B": {"type": "string"},
                            "PROVISIONER_ENV_C": {"type": "string"}
                        }
                    }
                }
            }
            "required": ["cpus"]
        }
    },
    "kernel_parameter_schema": {
        "title": "IPyKernel Parameters",
        "type": "object",
        "properties": {
            "kernel_parameters": {
               "type": "object",
                "properties": {
                      "cache_size": {"type": "integer", "description": "Set the size of the output cache", "default": 1000, "minimum": 0, "maximum": 50000},
                      "matplotlib": {"type": "string", "default": "auto", "enum": ["auto", "agg", "gtk", "gtk3", "inline", "ipympl", "nbagg", "notebook", "osx", "pdf", "ps", "qt", "qt4", "qt5", "svg", "tk", "widget", "wx"], "description": "Configure matplotlib for interactive use with the default matplotlib"}
                },
                "environment_variables": {
                    "type": "object",
                    "properties": {
                        "KERNEL_ENV_A": {"type": "string"},
                        "KERNEL_ENV_A": {"type": "string"},
                        "KERNEL_ENV_A": {"type": "string"}
                    }
                }
            }
        }
    }
}
```

## Client Applications
_Parameter-aware_ applications that retrieve kernel specifications from `/api/kernelspecs` will need to recognize the existence of any `kernel_provisioner.provisioner_parameter_schema` and `kernel_parameter_schema` values within the specification's `metadata` stanza.  When a kernel specification is selected and contains parameter schema information, the application should construct a dialog from the schema that prompts for parameter values.  Required values should be noted and default values should be pre-filled.  Command-line applications that cannot construct parameter inputs will need to rely on the provisioner using reasonable default values for any required parameters. (We will need to emphasize that all required values have reasonable defaults, but how that is handled is more a function of the kernel provider.)

Once the application has obtained the desired set of parameters, it will create an entry in the JSON body of the `/api/kernels` POST request that is a dictionary of two dictionaries, each consisting of name/value pairs.  The key under which this pair of dictionaries resides will be named `parameters`.  Provisioner parameters will reside under the key `provisioner_parameters`, while kernel parameters will be noted within `kernel_parameters`.  Each parameter-based dictionary can also include a dictionary named `environment_variables` corresponding to the encapsulating parameters directionary (provisioner or kernel). The kernels handler will then pass this dictionary to the framework, where the kernel launch method will act on it.

Here's an example of such a JSON body entry consisting of various parameters and their values...
```json
   "parameters": {
       "provisioner_parameters": {
           "cpus": 4,
           "memory": 512,
           "environment_variables": {
              "PROVISIONER_ENV_A": "research"
           }
        },
        "kernel_parameters": {
           "cache": 4,
           "environment_variables": {
              "KERNEL_ENV_A": "science"
           }
       }
    }
```

Note that applications that are unaware of parameterization will still behave in a reasonable manner provided the kernel provisioner applies reasonable default values to any required parameters and the administrator does the same for kernel-specific parameters.

In addition, it would be beneficial if the set of parameter values (i.e., the `parameters` dictionary) could be added into the notebook metadata (along with any other necessary information) so that subsequent launch attempts could use _those_ values in the pre-filled dialog.

## Kernel Launch
When a kernel is started, any parameters included in the keyword arguments should be validated prior to the kernel's launch (i.e., the startup of its hosting process).  The provisioner's `pre_launch()` method is meant for this purpose, although the actual location for validation is up to the provisioner's author, provided validaton occurs prior to the `KernelManager`'s return from its `start_kernel()` method.

Upon successful parameter validation, the kernel provisioner will be responsible for consuming its provisioner-specific parameters and applying any kernel-specific parameters to the templated `argv:` list.

Environment variables will be conveyed to the kernel process's environment and is, again, the responsibility of the kernel provisioner for how that is accomplished.

## Virtual Kernel Types
One of the advantages of kernel launch parameters is that one could conceivably have a single kernel configured, yet allow for a plethora of configuration options based on the parameter values - as @rgbkrk points out [here](https://github.com/takluyver/jupyter_kernel_mgmt/issues/9#issuecomment-496434455) - since this facility essentially _fabricates_ kernel types that, today, would require a separate specification for each set of options.

## Backwards Compatibility
Parameter-aware applications that are receiving results from the `/api/kernelspecs` REST API must be able to tolerate the _non-existence_ of `metadata.launch_parameter_schema` within the kernelspec results.  Likewise, parameter-unaware applications will need to ignore the parameter stanza - which is the case today.  

Kernel provisioners that support parameterized launches must also handle required parameters by providing reasonable defaults.  In addition, they must not assume that the application will provide those defaults - despite the fact that the schema for those required parameters define default values - since the application that is requesting the kernel start (via the POST on `/api/kernels`) may be unaware of this parameter mechanism.

## References
https://jupyter-client.readthedocs.io/en/latest/provisioning.html
https://github.com/jupyter/jupyter_client/issues/608
https://github.com/jupyter/jupyter_client/pull/612
https://github.com/takluyver/jupyter_kernel_mgmt/pull/22
https://github.com/jupyter/jupyter_client/issues/434
https://github.com/jupyter/enterprise_gateway/issues/640
https://paper.dropbox.com/doc/Day-1-Kernels-jupyter_client-IPython-Notebook-server--ApyJEjYtqrjfoPg1QpbxZfcpAg-MyS7d8X4wkkhRQy7wClXY
https://github.com/takluyver/jupyter_kernel_mgmt/issues/9


