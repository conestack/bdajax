# -*- coding: utf-8 -*-
from setuptools import find_packages
from setuptools import setup

version = '2.0.0dev0'
shortdesc = 'Ajax convenience.'

setup(
    name='bdajax',
    version=version,
    description=shortdesc,
    long_description='{0}\n{1}\n{2}'.format(
        open("README.rst").read(),
        open("CHANGES.rst").read(),
        open("LICENSE.rst").read()
    ),
    classifiers=[
        'Environment :: Web Environment',
        'Operating System :: OS Independent',
        'Programming Language :: JavaScript',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
    keywords='',
    author='BlueDynamics Alliance',
    author_email='dev@bluedynamics.com',
    url=u'https://github.com/bluedynamics/bdajax',
    license='Simplified BSD',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    namespace_packages=[],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'setuptools',
    ],
)
