#!/bin/sh
# 開機時向 Doppler 拿環境變數，再啟動網站。
#
# 登入不用密碼：向 Fly 要一張「這台機器是誰」的證明（OIDC token），拿去跟 Doppler 換通行證。
# 證明只有在這台機器裡面要得到，所以平台上就算外洩，也沒有可以拿去用的東西。
# 平台上只放 Doppler 機器帳號的 identity ID（DOPPLER_IDENTITY_ID，在 fly.dev.toml／fly.prod.toml，不是機密）。
set -eu

# 要跟 Doppler identity 設定裡的 Audience 一樣，不然 Doppler 會拒絕這張證明
OIDC_AUDIENCE="doppler"

# Fly 在每台機器裡提供 /.fly/api 這個 unix socket，向它要證明（有效 10 分鐘）
fly_oidc_token() {
  node -e '
    const http = require("node:http")
    const body = JSON.stringify({ aud: process.argv[1] })
    const req = http.request({
      socketPath: "/.fly/api",
      path: "/v1/tokens/oidc",
      method: "POST",
      headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body) },
    }, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => {
        if (res.statusCode !== 200) process.exit(1)
        // 去掉前後空白；回傳值如果被引號包住也一併去掉
        process.stdout.write(data.trim().replace(/^"|"$/g, ""))
      })
    })
    req.on("error", () => process.exit(1))
    req.end(body)
  ' "$OIDC_AUDIENCE"
}

# 失敗先重試：Doppler 或 Fly 一時連不上都可能發生
RETRY_SECONDS=5
logged_in=false
for attempt in 1 2 3 4 5; do
  if FLY_OIDC_TOKEN=$(fly_oidc_token) \
    && doppler oidc login --identity="$DOPPLER_IDENTITY_ID" --token="$FLY_OIDC_TOKEN" \
      --no-check-version --silent; then
    logged_in=true
    break
  fi
  echo "[start] Doppler 登入失敗（第 ${attempt} 次），${RETRY_SECONDS} 秒後重試" >&2
  sleep "$RETRY_SECONDS"
done

if [ "$logged_in" != true ]; then
  echo "[start] 登入不了 Doppler，不啟動網站" >&2
  exit 1
fi

# --no-fallback：不在硬碟留一份金鑰備份
# --no-liveness-ping：不要每 5 分鐘回報一次。Doppler 給的通行證 10 分鐘就過期
# （Doppler 後台 identity 設定的 TTL），之後的回報只會一直失敗
exec doppler run --project="$DOPPLER_PROJECT" --config="$DOPPLER_CONFIG" \
  --no-fallback --no-liveness-ping --no-check-version \
  -- node .output/server/index.mjs
