FROM denoland/deno:alpine-1.35.0

EXPOSE 4507

WORKDIR /app

# Prefer not to run as root
USER deno

COPY dist .
COPY mockServiceWorker.js .
COPY tools/deploy-mock/server.ts .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache server.ts

CMD ["run", "--allow-net", "--allow-read", "server.ts"]
