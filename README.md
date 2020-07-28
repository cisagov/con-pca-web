# Con-PCA Client
### Angular frontend application

### Requirements
* For local setup, Get the right flavor of Docker for your OS...
    - [Docker for Mac](https://docs.docker.com/docker-for-mac/install/)
    - [Docker for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
    - [Docker for Windows](https://docs.docker.com/docker-for-windows/install/)

    **Note:** The recommended requirement for deployment of this project is 4 GB RAM.
    For Docker for Mac, this can be set by following these steps:

    Open Docker > Preferences > Advanced tab, then set memory to 4.0 GiB

## Additional Suggestions

Here are some additional software to use along with develpment.
These items are not required for development.

- [VS Code](https://code.visualstudio.com/ "VS Code")
- [MongoDB Compass](https://www.mongodb.com/products/compass "MongoDB Compass")

## Local Install and Deployment:

Use `Makefile` to install and run all services.

### Setup and Build

Create your .env files
- `cp ./etc/env.dist .env`

Build containers:
- `make build`

To run the containers, use:
- `make up`

Your output will look like:

```shell
-> % make up
docker-compose up -d
Creating network "client_default" with the default driver
Creating cpa-web      ... done
```

Stop containers
- `make stop`

Remove containers
- `make down`

### To access the Angular app

Angular app located at [localhost:4200](http://localhost:4200)
