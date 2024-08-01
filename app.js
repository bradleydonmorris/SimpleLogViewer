const express = require("express");
const config = require("config");
const path = require("path")
var fs = require("fs");

const app = express();
const port = config.get("server.port");
const host = config.get("server.host");
const primaryFileExtension = config.get("primaryFileExtension");
const alternateFileExtensions = config.get("alternateFileExtensions");

const logsDir = path.resolve(config.get("logsDir"));
const logFilesBaseURL = "/logfiles"
app.use('/logfiles', express.static(logsDir))
app.get('/', (req, res) => {
	res.redirect("/logs/");
})
app.get('/logs*', (req, res) => {
	if (req.originalUrl == "/logs" || req.originalUrl == "/logs/") {
		var childrenLogs = fs.readdirSync(logsDir, { withFileTypes: true })
		if (childrenLogs.length < 1) {
			var html = "<html><head><title>Logs</title></head><body><div>No Logs Found!</div></body></html>";
		}
		else {
			var html = "<html><head><title>Logs</title></head><body><div><ul>";
			for (indexLog = 0; indexLog < childrenLogs.length; indexLog ++) {
				if (childrenLogs[indexLog].isDirectory()) {
					html += "<li>" + childrenLogs[indexLog].name + "</li>";
					var childrenApps = fs.readdirSync(path.join(logsDir, childrenLogs[indexLog].name), { withFileTypes: true })
					if (childrenApps.length > 0) {
						html += "<ul>";
						for (indexApp = 0; indexApp < childrenApps.length; indexApp ++) {
							if (childrenApps[indexApp].isDirectory()) {
								html += "<li><a href=\"/logs/" + childrenLogs[indexLog].name + "/" + childrenApps[indexApp].name + "\">" + childrenApps[indexApp].name + "</a></li>";
							}
						}
						html += "</ul>";
					}
				}
			}
			html += "</ul></div></body></html>";
		}
		res.send(html);
	}
	else {
		var html = "<html><head><title>Logs</title></head><body><div><a href=\"/logs/\">Home</a>" + req.originalUrl.substring(5).replaceAll("/", " / ") + "</div>";
		var logFilesDir = path.join(logsDir, req.originalUrl.substring(5));
		var childrenLogFiles = fs.readdirSync(logFilesDir, { withFileTypes: true });
		html += "<div><table border=\"1\"><thead><tr><th>Instance Number</th><th>Begin Time</th><th>End Time</th><th>Elapsed Time</th><th>Available Files</th></tr></thead><tbody>";
		for (indexLogFile = 0; indexLogFile < childrenLogFiles.length; indexLogFile ++) {
			if (childrenLogFiles[indexLogFile].isFile()
				&& path.extname(childrenLogFiles[indexLogFile].name) == primaryFileExtension) {
				primaryFileURL = path.posix.join(logFilesBaseURL, req.originalUrl.substring(5), childrenLogFiles[indexLogFile].name);
				availableFiles = "<a href=\"" + primaryFileURL + "\">" + primaryFileExtension.substring(1).toUpperCase() + "</a>";
				for (loopFileExt = 0; loopFileExt < alternateFileExtensions.length; loopFileExt ++) {
					alternateFilePath = path.join(logsDir, req.originalUrl.substring(5), childrenLogFiles[indexLogFile].name);
					alternateFilePath = path.format({ ...path.parse(alternateFilePath), base: "", ext: alternateFileExtensions[loopFileExt] });
					if (fs.existsSync(alternateFilePath)) {
						alternateFileURL = path.posix.join(logFilesBaseURL, req.originalUrl.substring(5), path.basename(alternateFilePath));
						availableFiles += "&nbsp;&nbsp;<a href=\"" + alternateFileURL + "\">" + alternateFileExtensions[loopFileExt].substring(1).toUpperCase() + "</a>";
					}
				}
				var jsonString = fs.readFileSync(
					path.join(logFilesDir, childrenLogFiles[indexLogFile].name),
					{ encoding: 'utf8', flag: 'r' }
				);
				logObject = JSON.parse(jsonString);
				html += "</tr>"
					+ "<td>" + logObject["Instance"]["InstanceNumber"] + "</td>"
					+ "<td>" + logObject["Instance"]["BeginTime"] + "</td>"
					+ "<td>" + logObject["Instance"]["EndTime"] + "</td>"
					+ "<td>" + logObject["Instance"]["ElapsedTime"] + "</td>"
					+ "<td>" + availableFiles + "</td>"
					+ "</tr>";
			}
		}
		html += "</tbody></table></div></body></html>";
		res.send(html);
	}
});
const server = app.listen(port, host, (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log(`Server is running on ${host}:${server.address().port}`);
});
