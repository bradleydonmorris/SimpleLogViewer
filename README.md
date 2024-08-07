# SimpleLogViewer


### Setup
```shell
sudo apt-get install npm
cd /usr/bin
#If you need to delete a previous install
#sudo rm -r SimpleLogViewer/
sudo git clone https://github.com/bradleydonmorris/SimpleLogViewer.git
cd SimpleLogViewer
git config --global --add safe.directory /usr/bin/SimpleLogViewer
sudo npm install
sudo nano config/default.json
```

### Sample config/default.json
```json
{
	"server": {
		"host": "<IP ADDRESS TO LISTEN ON>",
		"port": <PORT TO LISTEN ON>
	},
	"logsDir": "<FULL PATH TO THE LOGS TO EXPOSE>",
	"primaryFileExtension": ".json",
	"alternateFileExtensions": [ ".txt", ".html", ".pdf" ]
}
```

### To Start Web App
`node /usr/bin/SimpleLogViewer/app.js`

### To Start as a Deamon Using PM2
pm2 start /usr/bin/SimpleLogViewer/app.js