import TrelloApiError from './TrelloApiError';
const superagent = require('superagent');


function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}

function buildScopeString(scope) {
  const results = [];
  for (const key of Object.keys(scope)) {
    const e = scope[key];
    if (e) {
      results.push(key);
    }
  }

  return results.join(',');
}

function buildReturnUrl() {
  return `${location.protocol}//${location.host}${location.pathname}${location.search}` // eslint-disable-line no-restricted-globals
}

function buildAuthorizationUrl(options, apiKey) {
  const scopeString = buildScopeString(options.scope);
  const returnUrl = buildReturnUrl();
  return `https://trello.com/1/authorize?response_type=token&key=${apiKey}&return_url=${returnUrl}&callback_method=postMessage&scope=${scopeString}&expiration=${options.expiration}&name=${options.name.replace(/ /g, '+')}`
}

function buildAuthorizationWindowFeatures() {
  const left = window.screenX + ((window.innerWidth - 420) / 2);
  const top = window.screenY + ((window.innerHeight - 470) / 2);

  return `height=606,width=405,left=${left},top=${top}`;
}

class TrelloApiClient {
  constructor(key) {
    this.key = key;
    this.token = null;
    this.get = this.req.bind(this, 'get');
    this.post = this.req.bind(this, 'post');
    this.put = this.req.bind(this, 'put');
    this.del = this.req.bind(this, 'del');
    this.delete = this.req.bind(this, 'del');
  }

  setToken = (token) => {
    this.token = token;
  };

  auth = (opts) => {
    const defaults = Object.assign({}, {
      type: 'popup',
      name: 'My App',
      scope: {
        read: true,
        write: true,
        account: false
      },
      expiration: '1hour'
    });

    const options = mergeDeep(defaults, opts);
    const authorizationUrl = buildAuthorizationUrl(options, this.key);
    const authorizationWindowFeatures = buildAuthorizationWindowFeatures();
    const callback = (resolve, reject) => {
      const authWindow = window.open(authorizationUrl, 'trello', authorizationWindowFeatures);
      const timeout = setTimeout(() => { authWindow.close(); return reject(); }, 60000);

      const receiveMessage = (event) => {
        // return if event.origin != authEndpoint || event.source != authWindow
        if (event.source !== authWindow) {
          return false;
        }
        authWindow.close();
        clearTimeout(timeout);
        window.removeEventListener('message', receiveMessage, false);

        const token = event.data && /[0-9a-f]{64}/.test(event.data) ? event.data : null;
        this.setToken(token);
        resolve(token);
      };
      window.addEventListener('message', receiveMessage, false);
    };

    return new Promise(callback);
  };

  req = (method, path, data) => {

    let req;
    const { token, key } = this;

    if (method === 'get' || method === 'del') {
      req = superagent[method](`https://api.trello.com${path}`)
        .query({ key, token })
        .query(data)
      ;
    } else if (data.file && path.indexOf('attachments') !== -1  ) {
      req = superagent[method](`https://api.trello.com${path}`)
        .query({ key, token })
        .field('name', data.name)
        .field('mimeType', data.mimeType)
      ;

      if (typeof data.file === 'string') {
        if (window.Blob) {
          req = req.attach('file', new File([data.file], data.name, {
            type: data.mimeType
          }), data.name);
        } else {
          req = req.set({
            'Content-Type': 'boundary=----WebKitFormBoundarygZLBN6gxSW5OC5W1'
          }).send(`------WebKitFormBoundarygZLBN6gxSW5OC5W1\r\nContent-Disposition: form-data; name="name"\r\n\r\n${data.name}"\r\n------WebKitFormBoundarygZLBN6gxSW5OC5W1\r\nContent-Disposition: form-data; name="mimeType"\r\n\r\n${data.mimeType}\r\n------WebKitFormBoundarygZLBN6gxSW5OC5W1\r\nContent-Disposition: form-data; name="key"\r\n\r\n${key}\r\n------WebKitFormBoundarygZLBN6gxSW5OC5W1\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------WebKitFormBoundarygZLBN6gxSW5OC5W1\r\nContent-Disposition: form-data; name="file"; filename="${data.name}"\r\nContent-Type: application/octet-stream\r\n\r\n${data.file}\r\n------WebKitFormBoundarygZLBN6gxSW5OC5W1--\r\n`);
        }
      } else if (typeof data.file === 'object' && data.size) {
        req = req.attach('file', data.file, data.name);
      }
    } else {
      req = superagent[method](`https://api.trello.com${path}`)
        .query({ key, token })
        .type('json')
        .send(data)
      ;
    }

    const executor = (resolve, reject) => {
      req.end((err, res) => {
        if (err || !res.ok) {
          const trelloError = new TrelloApiError('error', err, res);
          reject(trelloError);
        } else {
          resolve(res.body);
        }
      });
    };
    return new Promise(executor);
  }
}

export default TrelloApiClient;
