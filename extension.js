const vscode = require('vscode');
const { exec } = require('child_process');
const request = require('request');
const os = require('os');
const { updateShorthandPropertyAssignment } = require('typescript');

var user;
var neighborhood;

let requestURI = "http://localhost:5000/pollwatcher"
let responseURI = "http://localhost:5000/pollreporter"

//let results = {}

const username = () => {
	let cmd = exec('whoami');
	cmd.stdout.on('data', (data) =>{
		user = data.trim();
	});
}

const location = () => {
	let path = os.homedir();
	let parts = path.split(/\\|\//);
	neighborhood = parts[1];
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	setInterval(()=>{
		request.post({
			uri: requestURI,
			body: {
				"user": user,
				"neighborhood": neighborhood
			},
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
	let id = prompt.id;
	vscode.window.showInformationMessage(
		message, 
		...votes
	).then((vote) => {
		// -1 index indicates that poll was closed/timed-out
		request.post({
			uri: responseURI,
			body: {
				"type": "vote",
				"poll_id": id,
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

username();
location();

module.exports = {
	activate,
	deactivate
}