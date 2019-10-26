const webpush = require('web-push');
const config = require('config');
const keys = require('./key.json')
webpush.setGCMAPIKey(config.GCMAPIKey);

var pushSubscription = {
    endpoint: keys.endpoint,
    keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
    }
};
// 送信するメッセージは、Json形式で送る必要がある
var message = JSON.stringify({
    title: 'web push test',
    body: 'web push test',
    link: 'mailto:example@yourdomain.org',
});
var options = {
    TTL: 10000,
    vapidDetails: {
        subject: 'mailto:example@yourdomain.org',
        // 先ほど生成したVAPIDの鍵情報をセットする
        publicKey: keys.publicKey,
        privateKey: keys.privateKey
    }
}
// npmのweb-pushライブラリを利用して、通知を送信する
webpush.sendNotification(pushSubscription, message, options).then((response)=>{
    console.log('connect success!!')
    console.log(response.message || '')
// 通知送信時にフォーマットエラーや必須パラメータの欠如、送信先が不明な場合などにエラーを検知する
}).catch((error) => {
    console.log(error);
});

