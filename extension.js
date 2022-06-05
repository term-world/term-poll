const vscode = require('vscode');
const { exec } = require('child_process');
const request = require('request');

var user;

let uri = "http://cdr.theterm.world:5000/pollwatcher" // Becomes localhost in actual implementation

const username = () => {
	let cmd = exec('whoami');
	cmd.stdout.on('data', (data) =>{
		user = data;
	});
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	username();
	setInterval(()=>{
		pollServer(user);
	},5000);
}

/**
 * 
 * @param {String} user 
 */
function pollServer(user){
	let response = request.post({
		uri: uri,
		body: {"user": user},
		json: true
	}, (err, response, body) => {
		showPrompt(body);
	});
}

/**
 * 
 * @param {Object} prompt 
 */
function showPrompt(prompt){
	let message = prompt.message;
	let votes = prompt.votes;
	vscode.window.showInformationMessage(
		message, 
		votes[0], votes[1]
	).then((vote) => {
		if(vote == votes[0]) console.log("For");
		if(vote == votes[1]) console.log("Against");
	});
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}