FROM node:18-alpine
WORKDIR /api_server/app
# ホストのpackage.jsonとpackage-lock.jsonをコンテナの/appにコピー
COPY ./app/package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; \
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && npm init; \
    fi

CMD sh -c "npm install && npm run start:dev"
