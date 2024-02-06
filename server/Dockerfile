FROM eclipse-temurin:11-jre-jammy as build
WORKDIR /opt/docker
COPY 2/opt /2/opt
COPY 4/opt /4/opt
COPY opt /opt
USER root
RUN ["chmod", "-R", "u=rX,g=rX", "/2/opt/docker"]
RUN ["chmod", "-R", "u=rX,g=rX", "/4/opt/docker"]
RUN ["chmod", "-R", "u=rX,g=rX", "/opt/docker"]
RUN ["chmod", "u+x,g+x", "/4/opt/docker/bin/knowledgebot"]

FROM eclipse-temurin:11-jre-jammy as mainstage
USER root
RUN id -u demiourgos728 1>/dev/null 2>&1 || (( getent group 0 1>/dev/null 2>&1 || ( type groupadd 1>/dev/null 2>&1 && groupadd -g 0 root || addgroup -g 0 -S root )) && ( type useradd 1>/dev/null 2>&1 && useradd --system --create-home --uid 1001 --gid 0 demiourgos728 || adduser -S -u 1001 -G root demiourgos728 ))
WORKDIR /opt/docker
COPY --from=build --chown=demiourgos728:root /2/opt/docker /opt/docker
COPY --from=build --chown=demiourgos728:root /4/opt/docker /opt/docker
COPY --from=build --chown=demiourgos728:root /opt/docker /opt/docker

EXPOSE 80 8080

RUN apt-get update
RUN apt-get install -y python3 && python3-pip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN pip3 install --no-cache-dir -r requirements.txt
USER 1001:0
ENTRYPOINT ["/opt/docker/bin/knowledgebot"]