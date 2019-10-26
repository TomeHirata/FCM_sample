/**
 * npm web-push パッケージ サイトを参考
 *    https://www.npmjs.com/package/web-push
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  /**
   * serviceWorkerからSubscriptionを取得する
   */
  async function getsubscription() {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    return sub;
  }
  
  /**
   * Subscriptionを取得するためにサーバ側で生成された
   * WebPush送信のための公開鍵をAPI経由で取得する
   */
  async function getPublicKey() {
    var res = await fetch('getpush', {
                      method: 'GET',
                      headers: { 'Content-Type': 'application/json' }
                    }).then((res) => res.json());
    console.log('APIのレスポンス');
    console.log(res.publicKey);
    return res.publicKey;
  }
  
  /**
   * サーバから取得した公開鍵を元に
   * ServiceWorkerからSubscriptionを取得する
   */
  async function subscribe(option) {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.subscribe(option);
    return sub;
  }
  
  /**
   * サーバから公開鍵を取得し、
   * ServiceWorkerからSubscriptionを取得する
   */
  async function initSubscribe() {
    var vapidPublicKey = await getPublicKey();
    let option = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    }
    return await subscribe(option);
	}
	
  /**
	 * 
	 * input に keyをbindする。 
	 */
  function setData(sub){
    const endpoint = document.querySelector('#subscription-endpoint');
    const key = document.querySelector('#subscription-public-key');
    const auth = document.querySelector('#subscription-auth');
    const rawKey = sub.getKey ? sub.getKey('p256dh') : '';
    key.value = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
    const rawAuthSecret = sub.getKey ? sub.getKey('auth') : '';
    auth.value = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
    endpoint.value = sub.endpoint;
    axios.post('/setkey', {
      endpoint: endpoint.value,
      p256dh: key.value,
      auth: auth.value,
    })
    .then(() => console.log("success"))
    .catch(() => console.log("error"))
	}
	
	/**
	 * push 通知をする
	 */
	function push(){
		axios.post("/send/webpush", {
				title: "Hi!",
				link: 'mailto:example@yourdomain.org',
				body: 'webpush test'
		})
	}

  
  /**
   * ページの読み込みが完了すれば、
   * WebPushを受け取るための準備を行う
   */
  window.addEventListener('load', async () => {
    navigator.serviceWorker.register('./serviceworker.js');
    // すでにserviseworkerが動いているか確認
    let sub = await getsubscription();
    if (!sub) {
      // ブラウザに通知許可を要求する
      var permission = await Notification.requestPermission();
      new Notification('WebPushの設定をしました');
      if (permission === 'denied') {
        return alert('ブラウザの通知設定をONにしてください');
      } else {
        sub = await initSubscribe();
        setData(sub);
      }
    } else {
        setData(sub);
    }
    console.log(sub);
  });