# umbraperf

Tool:  https://umbraperf.github.io/umbraperf

[![Umbra-Profiler Release & Deploy Process](https://github.com/umbraperf/umbraperf/actions/workflows/main.yml/badge.svg)](https://github.com/umbraperf/umbraperf/actions/workflows/main.yml)



## Branching structure
Post-release development should take place on **post-dev** branch. Each merge into **master** triggers an automated build pipeline; which gets published and es reachable under [https://umbraperf.github.io/umbraperf](https://umbraperf.github.io/umbraperf).
The build output is managed automatically in **gh-pages** branch and should NOT be changed anyhow.


## Get started 

To build the project, several version-specific dependencies need to be fulfilled. 
Please ensure the install the EXACT version of the following tools to get started.
Uninstall conflicting versions first. 


### node.js

To have a specific version of node, we use the **Node Version Manager (nvm)**.
Required version: 16.15.0

Remove old installations:
```
sudo apt-get remove -y nodejs
sudo apt-get remove -y npm
sudo apt-get autoremove -y
sudo rm -rf /usr/local/lib/node_modules
```

Install: 
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 16.15.0
```

### npm

Required version: 8.5.5
Install: 
```
npm install -g npm@8.5.5
```


### yarn

Required version: 1.22.18
Install:
```
npm install -g yarn@1.22.18
```

### node modules

Now we need to install all required modules at their specific version. This included Webpack, React, Vega, Wasm, and so on.

1. Make sure to remove currently installed packages first. To do so, remove while node_modules folder if available in project root folder.
2. Make sure **NOT** to remove any of the *LOCK* files (Cargo.lock, yarn.lock, package-lock.json). The files are needed to replicate the working configuration. 
3. Make sure to check out **post-dev** branch, as this branch contains the most up to date and working dependency configuration files. 
4. Trigger setup using following command. Please note the *--frozen-lockfile* flag, which ensures to replicate the working configuration from the given LOCK files.  
```
yarn install --frozen-lockfile
```

### start the development server 

After all modules are installed, we can use *Webpack* to compile the *WASM-backend*, bundle the resulting files, and serve the content via a development web server. 
This can simply be triggered running the command:
```
yarn run start
```

Everything should now work as expected. The tool can be accessed under http://localhost:<YARN_DEV_PORT>/umbraperf/#/ while YARN_DEV_PORT is normally port number 9002 if not configured else.

Happy hacking! 
