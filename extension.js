const vscode = require('vscode');
const { exec } = require('child_process');
const request = require('request');

var user;

let uri = "http://cdr.theterm.world:5000/pollwatcher"

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
	let response = request.get(uri, (err, data, body) => {
		let payload = JSON.parse(body);
		showPrompt(payload);
	});
}

function showPrompt(prompt){
	let message = prompt.question;
	let votes = prompt.votes;
	vscode.window.showInformationMessage(
		message, 
		votes[0], votes[1]
	).then((vote) => {
		if(vote == votes[0]) console.log("Yes");
		if(vote == votes[1]) console.log("No");
	});
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}