# AdaCoffeeForDev

Project to create simple markdown buttons to donate ADA. 

Small project to learn how to make transactions using the CIP30 standard and the cardano-serialization-lib .  


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

Code in cardano.ts is highly inspired by [cardano-wallet-connector](https://github.com/dynamicstrategies/cardano-wallet-connector) but packed in a class
