ARG NODE_VERSION=16.17.0-slim

FROM node:$NODE_VERSION

# Important to write files from docker with same permissions as your normal user
ARG USER_NAME=user
ARG USER_UID=1000
ARG USER_GID=1000

ENV USER_NAME=$USER_NAME
ENV USER_UID=$USER_UID
ENV USER_GID=$USER_GID

RUN apt-get update && \
    apt-get install -y git curl zsh wget && \
    apt-get autoremove -y && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*

RUN	groupadd -g $USER_GID -o $USER_NAME && \
    useradd -m -u $USER_UID -g $USER_GID -o $USER_NAME && \
    passwd -d $USER_NAME && \
    chown $USER_UID:$USER_GID /home/$USER_NAME

USER $USER_NAME

RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.1/zsh-in-docker.sh)" -t agnoster

WORKDIR /app
