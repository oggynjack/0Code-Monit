(1.20.0) For non-Docker users, you can create a new file named `.env` in the root directory. The format is like this:

```.env
0CODE_MONIT_HOST=127.0.0.1
0CODE_MONIT_PORT=8080
```

Server Argument Usage:

```bash
node server/server.js --host=127.0.0.1 --port=8080
```

## Server Environment Variables

| Environment Variable                                     | Server Argument               | Description                                                                                                                                                                                                                                                                                                                                                                |     Default |
| -------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------: |
| `DATA_DIR`                                               | `--data-dir=`                 | Set the directory where the data should be stored (could be relative)                                                                                                                                                                                                                                                                                                      |   `./data/` |
| `0CODE_MONIT_HOST` or `HOST`                             | `--host=`                     | Host to bind to, could be an ip.                                                                                                                                                                                                                                                                                                                                           |        `::` |
| `0CODE_MONIT_PORT` or `PORT`                             | `--port=`                     | Port to listen to                                                                                                                                                                                                                                                                                                                                                          |      `3001` |
| `0CODE_MONIT_SSL_KEY` or `SSL_KEY`                       | `--ssl-key=`                  | Path to SSL key                                                                                                                                                                                                                                                                                                                                                            |             |
| `0CODE_MONIT_SSL_CERT` or `SSL_CERT`                     | `--ssl-cert=`                 | Path to SSL certificate                                                                                                                                                                                                                                                                                                                                                    |             |
| `0CODE_MONIT_SSL_KEY_PASSPHRASE` or `SSL_KEY_PASSPHRASE` | `--ssl-key-passphrase=`       | (1.21.1) SSL Key Passphrase                                                                                                                                                                                                                                                                                                                                                |             |
| `0CODE_MONIT_CLOUDFLARED_TOKEN`                          | `--cloudflared-token=`        | (1.14.0) Cloudflare Tunnel Token                                                                                                                                                                                                                                                                                                                                           |             |
| `0CODE_MONIT_DISABLE_FRAME_SAMEORIGIN`                   | `--disable-frame-sameorigin=` | By default, 0Code Monit is not allowed in iframe if the domain name is not the same as the parent. It protects your 0Code Monit to be a phishing website. If you don't need this protection, you can set it to `true`                                                                                                                                                      |     `false` |
| `0CODE_MONIT_WS_ORIGIN_CHECK`                            |                               | By default, 0Code Monit is verifying that the websockets [`ORIGIN`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin)-Header matches your servers hostname. If you don't need this protection, you can set it to `bypass`. See [GHSA-mj22-23ff-2hrr](https://github.com/oggynjack/0code-monit/security/advisories/GHSA-mj22-23ff-2hrr) for further context. | `cors-like` |
| `0CODE_MONIT_ALLOW_ALL_CHROME_EXEC`                      | `--allow-all-chrome-exec=`    | (1.23.0) Allow to specify any executables as Chromium                                                                                                                                                                                                                                                                                                                      |         `0` |
| `NODE_EXTRA_CA_CERTS`                                    |                               | Add your self-signed ca certs. (e.g. /cert/path/CAcert.pem) [Read more](https://github.com/oggynjack/0code-monit/issues/1380)                                                                                                                                                                                                                                               |             |
| `NODE_TLS_REJECT_UNAUTHORIZED`                           |                               | Ignore all TLS errors                                                                                                                                                                                                                                                                                                                                                      |         `0` |
| `NODE_OPTIONS`                                           |                               | Set it to `--insecure-http-parser`, if you encountered error `Invalid header value char` when your website using WAF                                                                                                                                                                                                                                                       |             |

## Docker Specific Environment Variables

| Environment Variable | Description                         | Default |
| -------------------- | ----------------------------------- | ------: |
| `PUID`               | User id to access the data storage  |  `1000` |
| `PGID`               | Group id to access the data storage |  `1000` |

## For Development only

| Environment variable                       | Server argument | Description                                                                     |    Default |
| ------------------------------------------ | --------------- | ------------------------------------------------------------------------------- | ---------: |
| `NODE_ENV`                                 |                 | Set the NodeJS environment flag. `development`, `production`                    | production |
| `0CODE_MONIT_LOG_RESPONSE_BODY_MONITOR_ID` |                 | Monitor ID - If provided, it will output the monitor's response to your console |            |
| `0CODE_MONIT_HIDE_LOG`                     |                 | (1.15.0) Examples: `debug_monitor,info_monitor,debug_cert,warn_monitor`         |            |
| `SQL_LOG`                                  |                 | Set `1` to enable                                                               |            |
| `0CODE_MONIT_ENABLE_EMBEDDED_MARIADB`      |                 | (2.0.0) Set `1` to enable                                                       |            |
| `0CODE_MONIT_IN_CONTAINER`                 |                 | (1.23.0) Is 0Code Monit inside a container?                                     |            |

## MariaDB Environment Variables

| Environment Variable      | Description                                |
| ------------------------- | ------------------------------------------ |
| `0CODE_MONIT_DB_TYPE`     | (2.0.0) Database Type `sqlite`, `mariadb`  |
| `0CODE_MONIT_DB_HOSTNAME` | (2.0.0) Database hostname. for mariadb     |
| `0CODE_MONIT_DB_PORT`     | (2.0.0) Database port. for mariadb, `3306` |
| `0CODE_MONIT_DB_NAME`     | (2.0.0) Database name                      |
| `0CODE_MONIT_DB_USERNAME` | (2.0.0) Database username                  |
| `0CODE_MONIT_DB_PASSWORD` | (2.0.0) Database password                  |
