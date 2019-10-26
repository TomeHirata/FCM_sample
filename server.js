const express = require('express');
const app = express();
const webpush = require('web-push');
const config = require('config');
const fs = require('fs');
webpush.setGCMAPIKey(config.GCMAPIKey);
const vapidKeys = webpush.generateVAPIDKeys();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/getpush', (req, res) => {
  return res.json({
    publicKey: vapidKeys.publicKey
  });
});

app.post('/send/webpush', (req, res) => {
	res.setHeader('Content-Type', 'text/json');
	// ブラウザ側でプッシュサーバから取得した、Endpointとp256dh、authの認証情報をセットする
	var pushSubscription = {
			endpoint: req.body.endpoint,
			keys: {
					p256dh: req.body.p256dh,
					auth: req.body.auth
			}
	};
	// 送信するメッセージは、Json形式で送る必要がある
	var message = JSON.stringify({
		title: req.body.title,
		body: req.body.body,
		icon: req.body.icon,
		link: req.body.link,
	});
	var options = {
		TTL: 10000,
		vapidDetails: {
			subject: req.body.link,
			// 先ほど生成したVAPIDの鍵情報をセットする
			publicKey: vapidKeys.publicKey,
			privateKey: vapidKeys.privateKey
		}
	}
	// npmのweb-pushライブラリを利用して、通知を送信する
	webpush.sendNotification(pushSubscription, message, options).then((response)=>{
		// 認証情報を保存
		const result = {};
		result["endpoint"] = pushSubscription.endpoint
		result["p256dh"] = pushSubscription.keys.p256dh
		result["auth"] = pushSubscription.keys.auth
		result["publicKey"] = options.vapidDetails.publicKey;
		result["privateKey"] = options.vapidDetails.privateKey;
		fs.writeFileSync('./key.json', JSON.stringify(result));
		return res.json({
			statusCode: response.statusCode || -1,
			message: response.message || '',
		});
	// 通知送信時にフォーマットエラーや必須パラメータの欠如、送信先が不明な場合などにエラーを検知する
	}).catch((error) => {
		console.log(error);
		return res.json({
			statusCode: error.statusCode || -1,
			message: error.message || '',
		});
	});
});

app.listen(3000, function () {
	console.log('start server');
});
	
