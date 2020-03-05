# PL4 Server
#### Parking Lot 4 Project

## Intro

This repo contains the webserver implementation. It is currently written in Node.js and supports integrations through APIs and The Things Network.

## Get Started

### Prerequisites

- Install Node.js and NPM (recommended method below)
  - Install [Node Version Switcher](https://github.com/jasongin/nvs#setup)
  - Install the latest LTS version of Node.js:
    ```sh
    nvs add lts # Install Node
    nvs link lts # Set the default version
    ```


### Start the Server

#### Install project dependencies:

```sh
npm install
```

#### Run the webserver:

The server currently listens on port `3000`. Press `Ctrl+C` to quit.

```sh
npm start # watch for file changes
# OR
npm start:prod # simply run the server
```

## Client for the Sign
This repo contains an example client for automatically updating the sign (which is currently a prototype). Since the sign uses proprietary software, it currently only runs on Windows.

### Prerequisites
- Install Node.js and NPM (see above)
- [Install AutoHotkey](https://www.autohotkey.com/)
- [Install PowerLED LTS](http://en.led595.com/English/DownLoadDetail/64.htm)


#### Build the AHK script:
```
npm run build
```

#### Run the client:
Open PowerLED LTS and then run the following:
```
npm run sign
```

_More information will be added soon._
