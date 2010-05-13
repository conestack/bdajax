from setuptools import setup, find_packages
import sys, os

version = '1.0b1'
shortdesc = 'Ajax convenience.'
longdesc = open(os.path.join(os.path.dirname(__file__), 'README.txt')).read()

setup(name='bdajax',
      version=version,
      description=shortdesc,
      long_description=longdesc,
      classifiers=[
            'Development Status :: 4 - Beta',
            'Environment :: Web Environment',
            'Operating System :: OS Independent',
            'Programming Language :: Python', 
            'Topic :: Internet :: WWW/HTTP :: Dynamic Content',        
      ],
      keywords='',
      author='BlueDynamics Alliance',
      author_email='dev@bluedynamics.com',
      url=u'https://svn.plone.org/svn/collective/bdajax',
      license='GNU General Public Licence',
      packages=find_packages('src'),
      package_dir = {'': 'src'},
      namespace_packages=[],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
      ],
      extras_require = dict(
      ),
      tests_require=[
      ],
      test_suite = "",
      entry_points = """
      """
      )