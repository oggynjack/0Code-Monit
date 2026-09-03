FROM node AS build
RUN useradd --create-home ocode
USER ocode
WORKDIR /home/ocode
ARG TARGETPLATFORM
COPY --chown=ocode:ocode ./build/ ./build/
COPY --chown=ocode:ocode build.js build.js
RUN node build.js $TARGETPLATFORM

FROM debian:bookworm-slim AS release
RUN useradd --create-home ocode
USER ocode
WORKDIR /home/ocode
COPY --from=build /home/ocode/0code-push ./0code-push

ENTRYPOINT ["/home/ocode/0code-push"]
