# PESU bot in Javascript
<h2 align="center">
    <p>Rewrite for PESU Discord bot-js in Javascript</p>
<h2>
<p align="center">
    <a href="https://github.com/sach-12/pesu-bot-js/issues" alt="issues">
    <img alt="GitHub forks" src="https://img.shields.io/github/issues/sach-12/pesu-bot-js"></a>
    <a href="https://github.com/sach-12/pesu-bot-js/stargazers" alt="Stars">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/sach-12/pesu-bot-js"></a>
    <a href="https://github.com/sach-12/pesu-bot-js/blob/main/LICENSE" alt="License">
    <img alt="Github license" src="https://img.shields.io/github/license/sach-12/pesu-bot-js"></a>
    <a href="https://github.com/sach-12/pesu-bot-js/contributors" alt="Contributors">
    <img src="https://img.shields.io/github/contributors/sach-12/pesu-bot-js"/></a>
</p>

Refer to the python code [here](https://github.com/sach-12/pesu-bot)



## Setup
* Download the repo 
* Edit the **.env** adding your BOT's token
* Do **npm install** inside the src folder
* set up the **config.json** in the following format
    ![image](https://imgur.com/hwABak8.png)
* Start the BOT using the commmand **node index.js** in the same directory as **index.js**

## Folder Structure
```bash
├── src
│   ├── config.json
│   ├── index.js 
│   ├── package-lock.json
│   ├── package.json
│   ├── client-commands
│   │   └── commands.js
│   ├── node_modules
│   │   └── All modules are included in source code.
```

## Creating Commands
Creating a new command is simple, add a new export in the `/client-commands/commands.js` calling it whatever you want the command to be called, for example **ping**

Add the following code to the file. In every command you will always need to use this format. 

(message.channel.send() **is not reqired**, just an example). 

```javascript
    ping: function(message) {
        this.message = message;
        message.channel.send({
            content: `Pong!!!\nPing =${this.client.ws.ping} ms`
        });
    },
```
**Make sure to add the following line to every command**
`this.message = message;`
Also make sure to add the command in `config.json`


Further documentation can be found [here](https://discord.js.org/#/)

## Contribute
If you would like to contribute to the project please open a PR (Pull Request) clearly showing your changes.

If you wish to contribute to the bot, run these steps:
* Fork this repository or create branch in your username

* Do whatever changes you wish to do and create a pull request with the following information furnished in the request message: The cog you wish to change | What did you change
* Send a review request to any of the following members: Flab-E, sach-12, Mre11i0t and/or ArvindAROO.
* Wait for approval for reviewers. Your PR may be directly accepted or requested for further changes.
* If you are accepted, you will be added to the contributors list.

**Note: Send PR to dev branch only**

## Issues
If you have any issues feel free to open an issue or text in the discord server.
## Extra
Credits for the format - [here](https://github.com/LachlanDev/Discord-BOT-Template)