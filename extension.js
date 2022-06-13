const vscode = require('vscode');
const { exec } = require('child_process');
const request = require('request');

var user;

let requestURI = "http://localhost:5000/pollwatcher"
let responseURI = "http://localhost:5000/pollreporter"

let results = {}

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
		let response = request.post({
			uri: requestURI,
			body: {"user": user},
			json: true
		}, (err, response, body) => {
			processPrompt(body);
		});
	},5000);
}

/**
 * 
 * @param {Object} prompt 
 */
function processPrompt(prompt){
	let message = prompt.message;
	let votes = prompt.votes;
	vscode.window.showInformationMessage(
		message, 
		...votes
	).then((vote) => {
		// -1 index indicates that poll was closed/timed-out
		let transmit = request.post({
			uri: responseURI,
			body: {
				"type": "vote",
				"question": message,
				"user": user,
				"choice": vote
			},
			json:true
		}, (err, response, body) => {
			console.log(body);	
		});
	});
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}