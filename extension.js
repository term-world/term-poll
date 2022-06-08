const vscode = require('vscode');
const { exec } = require('child_process');
const request = require('request');

var user;

let uri = "http://localhost:5000/pollwatcher" // Becomes localhost in implementation
let urj = "http://localhost:5000/pollreporter" // Becomes localhost in implementation

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
		...votes
	).then((vote) => {
		console.log(votes.indexOf(vote)); // -1 index indicates that poll was closed/timed-out
		// TO-DO: transmit this data to term-api
		results[vote] += user;
		console.log(results)
	});
}

// NEW function
function pollResults(results){
	let resultResponse = request.post({
		uri: urj,
		body: {"results": results},
		json: true
	}, (err, resultResponse, body) => {
		console.log(body);
	});
}

//function showResults(results) {}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}