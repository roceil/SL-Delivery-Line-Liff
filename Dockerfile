# Fly.io 用（Zeabur 有 zbpack.json 的 ignore_dockerfile，不會用這份），內容照 zeabur-to-fly skill 的範本。

FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM node:22-slim
WORKDIR /app
# 開機時用 Doppler CLI 拿環境變數，見 start.sh。
# slim 映像檔沒有系統憑證：Node 自帶一份所以網站不受影響，
# 但 Doppler CLI 用的是系統那份，少了它會連不上（x509: certificate signed by unknown authority）
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# 從官方映像檔直接拿執行檔。用 digest 固定，標籤可能被重新推送
COPY --from=dopplerhq/cli:3.77.0@sha256:bc59e0e97ea596a2c402f108043b9fd6ad574db253998364de939c0ca373453e /bin/doppler /usr/local/bin/doppler
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build /app/.output ./.output
COPY start.sh ./start.sh
EXPOSE 3000
CMD ["sh", "./start.sh"]
