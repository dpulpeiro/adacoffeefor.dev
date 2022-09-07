# React Typescript Tailwind Starter

Starter project with React, typescript, tailwind, eslint and prettier ready to use

## 🧐 Project structure
    .
    ├── devops              -> Contains Dockerfiles ready to for for both development and production environments
    ├── public
    ├── src
    ├── .eslintrc.json      -> Eslint config
    ├── .gitignore
    ├── .prettierrc         -> Prettier config
    ├── Makefile            -> Used to build docker images
    ├── tailwind.config.js  -> Tailwind config
    ├── postcss.config.js   -> Postcss config
    └── README.md

## 🚀 Makefile usage
Makefile variables that can be customized:

| Variable | Default      |
|----------|:-------------:|
| DOCKER_IMAGE_NAME | react-typescript-tailwind-eslint-prettier |
| PROD_TAG|0.0.1|
|NODE_VERSION|16.17.0-slim|
|NGINX_VERSION|1.23.1-alpine|


* Build docker image for development
    ```
    make dev/build
    ```
* Build docker image for production (deployed on nginx)
    ```
    make prod/build
    ```
* Run development docker
    ```
    make dev/shell
    ```
* Run production docker in local port 8000 
    ```
    make prod/local
    ```
