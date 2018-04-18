# -*- coding: utf-8 -*-
#
# malcolmjs documentation build configuration file, created by
# sphinx-quickstart on Tue Apr 17 10:36:45 2018.
#
# This file is execfile()d with the current directory set to its
# containing dir.
#
# Note that not all possible configuration values are present in this
# autogenerated file.
#
# All configuration values have a default; values that are commented out
# serve to show the default.

import sys
import os
import shlex

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#sys.path.insert(0, os.path.abspath('.'))

# -- General configuration ------------------------------------------------
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.intersphinx',
    'sphinx.ext.viewcode',
    'sphinx.ext.inheritance_diagram',
    'sphinx.ext.graphviz',
]

autoclass_content = "both"

autodoc_member_order = 'bysource'

graphviz_output_format = "svg"

# If true, Sphinx will warn about all references where the target can't be found
nitpicky = True

# The name of a reST role (builtin or Sphinx extension) to use as the default
# role, that is, for text marked up `like this`
default_role = "any"

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# The suffix of source filenames.
source_suffix = '.rst'

# The master toctree document.
master_doc = 'contents'

# General information about the project.
project = u'malcolmjs'
copyright = u'2018, Tom Cobb, Ray Millward, Bryan Tester'
author = u'Tom Cobb, Ray Millward, Bryan Tester'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = '1.0'
# The full version, including alpha/beta/rc tags.
release = '1.0'

# The language for content autogenerated by Sphinx. Refer to documentation
# for a list of supported languages.
#
# This is also used if you do content translation via gettext catalogs.
# Usually you set "language" from the command line for these cases.
language = None

# There are two options for replacing |today|: either, you set today to some
# non-false value, then it is used:
#today = ''
# Else, today_fmt is used as the format for a strftime call.
#today_fmt = '%B %d, %Y'

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
exclude_patterns = []

# The reST default role (used for this markup: `text`) to use for all
# documents.
#default_role = None

# If true, '()' will be appended to :func: etc. cross-reference text.
#add_function_parentheses = True

# If true, the current module name will be prepended to all description
# unit titles (such as .. function::).
#add_module_names = True

# If true, sectionauthor and moduleauthor directives will be shown in the
# output. They are ignored by default.
#show_authors = False

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = 'sphinx'

intersphinx_mapping = dict(
    python=('https://docs.python.org/2.7/', None),
    scanpointgenerator=(
        'http://scanpointgenerator.readthedocs.io/en/latest/', None),
    numpy=('https://docs.scipy.org/doc/numpy/', None),
    tornado=('http://www.tornadoweb.org/en/stable/', None),
)

# A dictionary of graphviz graph attributes for inheritance diagrams.
inheritance_graph_attrs = dict(rankdir="TB")

# -- Options for HTML output ----------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
# on_rtd is whether we are on readthedocs.org
on_rtd = os.environ.get('READTHEDOCS', None) == 'True'

if not on_rtd:  # only import and set the theme if we're building docs locally
    import sphinx_rtd_theme
    html_context = dict(css_files=[])
    html_theme = 'sphinx_rtd_theme'
    html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]


# Add any paths that contain custom themes here, relative to this directory.
#html_theme_path = []

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

# Custom sidebar templates, maps document names to template names.
#html_sidebars = {}

# Additional templates that should be rendered to pages, maps page names to
# template names.
#html_additional_pages = {}

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.
html_show_sphinx = False

# If true, "(C) Copyright ..." is shown in the HTML footer. Default is True.
html_show_copyright = True

# Output file base name for HTML help builder.
htmlhelp_basename = 'malcolmdoc'

# Logo
html_logo = 'malcolm-logo.svg'
html_favicon = 'malcolm-logo.ico'



# Output file base name for HTML help builder.
htmlhelp_basename = 'malcolmjsdoc'

# -- Options for LaTeX output ---------------------------------------------

latex_elements = {
# The paper size ('letterpaper' or 'a4paper').
#'papersize': 'letterpaper',

# The font size ('10pt', '11pt' or '12pt').
#'pointsize': '10pt',

# Additional stuff for the LaTeX preamble.
#'preamble': '',

# Latex figure (float) alignment
#'figure_align': 'htbp',
}

# Grouping the document tree into LaTeX files. List of tuples
# (source start file, target name, title,
#  author, documentclass [howto, manual, or own class]).
latex_documents = [
  (master_doc, 'malcolmjs.tex', u'malcolmjs Documentation',
   u'Tom Cobb, Ray Millward, Bryan Tester', 'manual'),
]

# The name of an image file (relative to this directory) to place at the top of
# the title page.
#latex_logo = None

# For "manual" documents, if this is true, then toplevel headings are parts,
# not chapters.
#latex_use_parts = False

# If true, show page references after internal links.
#latex_show_pagerefs = False

# If true, show URL addresses after external links.
#latex_show_urls = False

# Documents to append as an appendix to all manuals.
#latex_appendices = []

# If false, no module index is generated.
#latex_domain_indices = True


# -- Options for manual page output ---------------------------------------

# One entry per manual page. List of tuples
# (source start file, name, description, authors, manual section).
man_pages = [
    (master_doc, 'malcolmjs', u'malcolmjs Documentation',
     [author], 1)
]

# If true, show URL addresses after external links.
#man_show_urls = False


# -- Options for Texinfo output -------------------------------------------

# Grouping the document tree into Texinfo files. List of tuples
# (source start file, target name, title, author,
#  dir menu entry, description, category)
texinfo_documents = [
  (master_doc, 'malcolmjs', u'malcolmjs Documentation',
   author, 'malcolmjs', 'One line description of project.',
   'Miscellaneous'),
]

# Documents to append as an appendix to all manuals.
#texinfo_appendices = []

# If false, no module index is generated.
#texinfo_domain_indices = True

# How to display URL addresses: 'footnote', 'no', or 'inline'.
#texinfo_show_urls = 'footnote'

# If true, do not generate a @detailmenu in the "Top" node's menu.
#texinfo_no_detailmenu = False

# Common links that should be available on every page
rst_epilog = """
.. _Mapping project:
    https://indico.esss.lu.se/event/357/session/8/contribution/63

.. _EPICS:
    http://www.aps.anl.gov/epics/

.. _PVs:
    https://ics-web.sns.ornl.gov/kasemir/train_2006/1_3_CA_Overview.pdf

.. _GDA:
    http://www.opengda.org/

.. _pvAccess:
    http://epics-pvdata.sourceforge.net/arch.html#Network

.. _websockets:
    https://en.wikipedia.org/wiki/WebSocket

.. _Diamond Light Source:
    http://www.diamond.ac.uk

.. _JSON:
    http://www.json.org/

.. _areaDetector:
    http://cars.uchicago.edu/software/epics/areaDetector.html

.. _YAML:
    https://en.wikipedia.org/wiki/YAML

.. _IPython:
    https://ipython.org

.. _decorators:
    https://realpython.com/blog/python/primer-on-python-decorators/

.. _Scan Point Generator:
    http://scanpointgenerator.readthedocs.org/en/latest/writing.html

.. _NeXus:
    http://www.nexusformat.org/

.. _HDF5:
    https://support.hdfgroup.org/HDF5/

"""
