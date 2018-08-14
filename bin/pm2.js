#! /usr/bin/env node

const shell = require("shelljs");

// default delete existing pm2 processes and start new
let command = "pm2 delete pm2-xml-flow.json pm2-xml-stream.json && pm2 start pm2-xml-flow.json pm2-xml-stream.json";

function printCommandDetails() {
    console.log(`
        usage - npm start [option]
        options -
        1       -   start xml-flow process
        2       -   start xml-stream process
        12      -   start xml-flow & xml-stream processes
        01      -   stop xml-flow process
        02      -   stop xml-stream process
        012     -   stop xml-flow & xml-stream processes
        --help  -   command help
    `);
}

if (process.argv && process.argv.length > 2) {
    switch (process.argv[2]) {
        case "1":
            command = "pm2 delete pm2-xml-flow.json && pm2 start pm2-xml-flow.json";
            break;
        case "2":
            command = "pm2 delete pm2-xml-stream.json && pm2 start pm2-xml-stream.json";
            break;
        case "12":
            break;
        case "01":
            command = "pm2 delete pm2-xml-flow.json";
            break;
        case "02":
            command = "pm2 delete pm2-xml-stream.json";
            break;
        case "012":
            command = "pm2 delete pm2-xml-flow.json pm2-xml-stream.json";
            break;
        case "help":
            return printCommandDetails();
            break;
        default:
            break;
    }
}

try {
    shell.exec(command);
} catch (error) {
    console.error(error);
}