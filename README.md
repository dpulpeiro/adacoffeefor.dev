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

## Deployment
This small websilte is deployed using [CloudFlare Pages](https://pages.cloudflare.com/). 
The file '.nvmrc' is to indicate the NODE_VERSION needed for building the page in cloudflare pages.

## **Image link below is make with this website**

[<img src="https://adacoffeefordev.dpulpeiro.xyz/cardano.png" style='height: 50px;border-radius: 22px;'>](https://adacoffeefordev.dpulpeiro.xyz/donate/?markdown=%23%23%20AdaCoffeeForDev%0A%0AProject%20to%20create%20simple%20markdown%20buttons%20to%20donate%20ADA.%20%0A%0ASmall%20project%20to%20learn%20how%20to%20make%20transactions%20using%20the%20CIP30%20standard%20and%20the%20cardano-serialization-lib%20.%20%20%0A%0A%0A**My%20links%3A**%0A%3E%3E%20%3Cimg%20class%3D%22inline%22%20src%3D%22%2Fsocial%2Flinkedin.png%22%2F%3E%20%20%5BLinkedin%5D(https%3A%2F%2Fwww.linkedin.com%2Fin%2Fdaniel-garc%25C3%25ADa-pulpeiro%2F)%0A%0A%3E%3E%20%3Cimg%20class%3D%22inline%22%20src%3D%22%2Fsocial%2Fgithub.png%22%2F%3E%20%5BGithub%5D(https%3A%2F%2Fgithub.com%2Fdpulpeiro)%20%0A%0A%0A&address=addr1qy26q49m00lf4gz029s0pql66nrra25e4u67lvxtsex09rky0wtucnjzhuzfgw307hyc5dj6g6hhjsdjnn48rflrlw7quflrg9)
