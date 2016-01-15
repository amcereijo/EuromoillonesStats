'use strict';

const http = require('https');
const fs = require('fs');

function getCSVData() {
	return new Promise((resolve, reject) => {
		http.get({
		    host: 'docs.google.com',
		    path: '/spreadsheets/d/1JGenc59xTbfWakjESO7fiBOT1rkk8n42kRbH2TjuP_w/pub?output=csv'
		}, (response) => {
		    let body = '';
		    response.on('data', (d) => {
		        body += d;
		    });
		    response.on('end', () => {
		        resolve(body);
		    });
		});
	});
}

function writeCSVData(data) {
	return new Promise((resolve, reject) => {
		const fileName = 'euromillones.csv';
		fs.writeFile(fileName, data, function(err) {
		  if (err) {
		  	console.error('Error writeCSVData: ', err);
		  	reject(err);
		  } else {
		  	console.log('Saved csv file!');
		  	resolve(fileName);
		  }
		});
	});
}

function showStatistic(fileName) {
	fileName = fileName || 'euromillones.csv';
	return new Promise((resolve, reject) => {
		const lineReader = require('readline').createInterface({
		  input: fs.createReadStream(fileName)
		});
		const statics = {
			numbers: {},
			stars: {}
		};
		let first = true;

		lineReader.on('line', (lines) => {
			if(!first) {
				lines = lines.split(',').slice(1);
				for(let i=0;i<5;i++) {
					statics.numbers[lines[i]] = (statics.numbers[lines[i]]) ? statics.numbers[lines[i]] + 1 : 1;
				}
				for(let i=6;i<8;i++) {
					statics.stars[lines[i]] = (statics.stars[lines[i]]) ? statics.stars[lines[i]] +1 : 1;
				}
			} else {
				first = false;
			}
		});

		lineReader.on('close', () => {

			const printSorted = (dataObject) => {
				const sortedData = [];
				for (const element in dataObject) {
					sortedData.push([element, dataObject[element]])
				}
				sortedData.sort(function(a, b) {return b[1] - a[1]})
				for(let i=0;i<sortedData.length;i++) {
					console.log('\tNumber: ', sortedData[i][0], ' => ', sortedData[i][1], ' times' );
				}
			};

			console.log('Numbers:');
			printSorted(statics.numbers);

			console.log('\nStars:');
			printSorted(statics.stars);

			resolve(fileName);
		});
	});
}

function removeCSVFile(fileName) {
	fileName = fileName || 'euromillones.csv';
	return new Promise((resolve, reject) => {
		fs.unlink(fileName, (err) => {
			if(err) {
				console.error('Erro deleting csv file: ', err);
				reject(err);
			} else {
				console.log('csv file deleted');
				resolve();
			}
		});
	});
}

getCSVData()
	.then(writeCSVData)
	.then(showStatistic)
	.then(removeCSVFile)
	.catch((err) => { console.log('Process end with error: ', err); });

