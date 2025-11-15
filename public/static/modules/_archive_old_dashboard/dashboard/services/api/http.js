// public/static/modules/dashboard/services/api/http.js
// یک کلاینت واحد برای تمام درخواست‌های API
// استفاده: TitanHTTP.get('/api/path'), TitanHTTP.post('/api/path', body)

(function (global) {
  const DEFAULT_TIMEOUT = 30000;

  function request(method, url, { params, body, headers } = {}) {
    // ساخت querystring
    const qs = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT);

    return fetch(url + qs, {
      method,
      headers: Object.assign(
        { "Content-Type": "application/json" },
        headers || {}
      ),
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      credentials: "same-origin"
    })
      .then(async (res) => {
        clearTimeout(id);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = new Error(data?.message || `HTTP ${res.status}`);
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
  }

  const api = {
    get: (url, opts) => request("GET", url, opts),
    post: (url, body, opts) => request("POST", url, { ...(opts || {}), body }),
    put: (url, body, opts) => request("PUT", url, { ...(opts || {}), body }),
  };

  global.TitanHTTP = api;
})(window);
