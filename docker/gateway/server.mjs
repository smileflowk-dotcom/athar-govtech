import http from "node:http";

const listenPort = Number(process.env.GATEWAY_PORT || 8080);
const upstreamHost = process.env.ATHAR_UPSTREAM_HOST || "athar";
const upstreamPort = Number(process.env.ATHAR_UPSTREAM_PORT || 3000);

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      host: upstreamHost,
      port: upstreamPort,
      method: request.method,
      path: request.url,
      headers: {
        ...request.headers,
        host: `${upstreamHost}:${upstreamPort}`,
        connection: "close",
      },
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );

  upstream.on("error", (error) => {
    console.error("ATHAR gateway upstream error", error.message);
    if (!response.headersSent) {
      response.writeHead(502, { "content-type": "application/json" });
    }
    response.end(JSON.stringify({ error: "ATHAR local indisponible" }));
  });

  request.pipe(upstream);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`ATHAR local gateway listening on ${listenPort}`);
});
