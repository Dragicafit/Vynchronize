# Wakanim With Friends

This extension allows you to enjoy your favorite anime on Wakanim with your friends.

## Install

- Firefox: Download the xpi release, go to about:debugging#/runtime/this-firefox, click on Load Temporay Add-on... and select the xpi file

- Chrome: Download the crx release, go to chrome://extensions, enable debugging and drag the crx file

## Developing or debugging

This project uses [Node.js](https://nodejs.org/en/).

To install all the depedencies, use the [command `npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) :

```sh
$ npm install
```
Compile the extension:
```sh
$ npm run release
```
Then start the server:

```sh
$ ./script
```
Finaly load the extension in your browser:

- Firefox: Go to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox), click on Load Temporay Add-on... and select the folder

- Chrome: Go to [chrome://extensions](chrome://extensions), enable debugging, click on Load Unpacked and select the folder