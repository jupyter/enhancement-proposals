# New kernel discovery framework

## Problem

It's common for a programmer to have several separate 'environments', with
different packages installed, on one computer. Virtualenv, conda and pyenv are
popular tools to do this for the Python language, while container systems
such as Docker and Singularity can be used for a similar purpose.

The 'kernelspecs' system was designed to tell Jupyter about roughly
one kernel for each programming language. With care, it's possible to use it
to describe kernels running the same language in different environments, but
there are pitfalls which result in user confusion. Symptoms include:

- You have installed a package, but you can't import it, or you load the wrong
  version, because the kernel is not running in the environment you think.
- Your kernel won't start at all, because you have a kernelspec created from
  an environment you later deleted.

Packages such as [nb_conda_kernels](https://github.com/Anaconda-Platform/nb_conda_kernels)
manage available kernels differently. However, they replace the default
kernelspec system, rather than adding to it. Some also affect only the
Jupyter Notebook server application, so the available kernels are inconsistent
across applications.

## Proposed Enhancement

Three related changes are proposed to improve the situation:

1. A new extension mechanism, *kernel providers*, which allows more than one
   installed package to discover and launch kernels, along with a namespacing
   mechanism for kernel types.
2. A convention that *kernel type IDs*, unique names identifying specific kernel
   types in the provider system, should be exposed in user interfaces where
   kernels are listed.
3. Relaxing the relationship between a notebook file and a specific named
   kernel, which may not exist when the notebook is sent to another computer.

## Detail Explanation

### Kernel providers mechanism

This has been developed experimentally in two repositories, which this proposal
would move to the Jupyter organisation on GitHub:

- https://github.com/takluyver/jupyter_kernel_mgmt
- https://github.com/takluyver/jupyter_protocol

More details are available at those repositories, and in the
[jupyter_kernel_mgmt docs](https://jupyter-kernel-mgmt.readthedocs.io/en/latest/),
but a summary follows.

Kernel providers are discovered by Python
[entry points](https://entrypoints.readthedocs.io/en/latest/), which can be
installed as part of any Python package. Each provider has an ID, a method to
list kernels that it knows about, and a method to launch a kernel of a named
type.

Kernel type IDs are a combination of the provider's ID, and the provider's name
for that kernel. For instance, a built-in kernel provider called `spec`
uses the existing kernelspec mechanism, and it may advertise a kernel name
`python3`. The kernel type ID would be `spec/python3`. Another kernel type from
another provider may have ID `conda/env-py38`.

Orthogonally to this proposal, the new kernel management APIs are built to be
asynchronous by default (with blocking wrappers), and include a mechanism to
pass parameters to a kernel at launch.

### Exposing kernel type IDs in UI

Kernelspecs include a 'display name' field, e.g. `"Python 3"`, meant to be used
in UI in preference to the unique name, e.g. `"python3"`.
However, experience has shown that it's easy to end up with multiple kernel
types with the same display name, which are then impossible to distinguish in UI.
The kernel provider framework will likely exacerbate this.

This proposal strongly recommends that applications make the unique kernel
type IDs (e.g. `spec/python3`) fully visible in the user interface.
This could be presented alongside display names or other useful information.

Using semi-readable unique names is familiar to programmers - we do this all
the time with variables, filenames, URLs, etc. It was a mistake to hide this
simple concept behind a confusing 'user friendly' veneer.

### Don't name kernels in notebook metadata

When we thought of kernels as roughly one per language, it made sense to
name the kernel in notebook metadata - a Julia notebook should obviously have a
Julia kernel.

As environments proliferate and notebooks are widely shared, this is a problem.
You may create a notebook with a kernel named after one of your environments,
then share it with a coworker who doesn't have an environment with that name.
Or you may run a notebook in a command line tool, and be surprised when it
ignores the environment you have chosen in the shell.

We hope that freeing tools from the constraint of a kernel named in the file
will allow them to experiment with different ways of finding or
creating a suitable kernel to run the notebook. We offer the following
guidelines for this:

1. In most cases, it's still important to match the programming language of the
   code in the notebook with the kernel that will run it.
2. The active environment is often a big hint, especially for command-line
   tools. If you have activated environment X and you run something which
   decides to execute code in environment Y, there's a good chance that's a
   nasty surprise.
3. *In the face of ambiguity, refuse the temptation to guess.* (borrowed from
   [the Zen of Python](https://www.python.org/dev/peps/pep-0020/))

## Pros and Cons

Pros associated with this implementation include:
* Hopefully, in the long run, more transparency about what kernels are available
  and which is used.
* Better foundations for remote kernels, kernels inside containers, etc.

Cons associated with this implementation include:
* Extra complexity - this keeps the kernelspec mechanism (for compatibility)
  while building an extra layer of public API above that.

## Interested Contributors

Thomas Kluyver, Kevin Bates

(Feel free to add to this list)
