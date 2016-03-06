Prerequisites
=============

[node.js](http://nodejs.org/)  
[git](http://git-scm.com/)  

Getting started
===============

To use the source, you will need to install node.js and git (git is required for bower), the application requires only these to be globally installed, the remainder of its dependencies are installed locally when required.

To start the local server, unzip the source, open a command prompt or terminal at the location and run the following command:

```npm start```

The first time this command is run will take a couple of minutes to complete, as all npm and bower dependencies are downloaded and installed, but after that should only take 10-15 seconds to start.

Once ready, the command window will report that the web application can be accessed via the following local address: http://localhost:9001

To run the web application for use on a web server, you can build a pure HTML (static) build by running the following command:

```npm run build```

After a couple of minutes the build process will be complete, and an optimized pure HTML build will be available in the build directory.
