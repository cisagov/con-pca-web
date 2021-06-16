
<<<<<<< HEAD
# Con-PCA Client #
=======
[![GitHub Build Status](https://github.com/cisagov/skeleton-docker/workflows/build/badge.svg)](https://github.com/cisagov/skeleton-docker/actions/workflows/build.yml)
[![CodeQL](https://github.com/cisagov/skeleton-docker/workflows/CodeQL/badge.svg)](https://github.com/cisagov/skeleton-docker/actions/workflows/codeql-analysis.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/cisagov/skeleton-docker/badge.svg)](https://snyk.io/test/github/cisagov/skeleton-docker)
>>>>>>> b1949f9b301eef109150dfcb1febfa376e3997d8

## Requirements ##

* For local setup, Get the right flavor of Docker for your OS...
  * [Docker for Mac](https://docs.docker.com/docker-for-mac/install/)
  * [Docker for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  * [Docker for Windows](https://docs.docker.com/docker-for-windows/install/)

  **Note:** The recommended requirement for deployment of this project is 4 GB RAM.
  For Docker for Mac, this can be set by following these steps:

<<<<<<< HEAD
  Open Docker > Preferences > Advanced tab, then set memory to 4.0 GiB

## Additional Suggestions ##

Here are some additional software to use along with develpment.
These items are not required for development.

* [VS Code](https://code.visualstudio.com/ "VS Code")
* [MongoDB Compass](https://www.mongodb.com/products/compass "MongoDB Compass")

## Local Install and Deployment ##

Use `Makefile` to install and run all services.

## Setup and Build ##

Create your .env files

* `cp ./etc/env.dist .env`

Build containers:

* `make build`

To run the containers, use:

* `make up`

Your output will look like:

```shell
-> % make up
docker-compose up -d
Creating network "client_default" with the default driver
Creating cpa-web      ... done
```
=======
## Running ##

### Running with Docker ###

To run the `cisagov/example` image via Docker:

```console
docker run cisagov/example:0.0.1
```

### Running with Docker Compose ###

1. Create a `docker-compose.yml` file similar to the one below to use [Docker Compose](https://docs.docker.com/compose/).

    ```yaml
    ---
    version: "3.7"

    services:
      example:
        image: cisagov/example:0.0.1
        volumes:
          - type: bind
            source: <your_log_dir>
            target: /var/log
        environment:
          - ECHO_MESSAGE="Hello from docker-compose"
        ports:
          - target: 8080
            published: 8080
            protocol: tcp
    ```

1. Start the container and detach:

    ```console
    docker-compose up --detach
    ```

## Using secrets with your container ##

This container also supports passing sensitive values via [Docker
secrets](https://docs.docker.com/engine/swarm/secrets/).  Passing sensitive
values like your credentials can be more secure using secrets than using
environment variables.  See the
[secrets](#secrets) section below for a table of all supported secret files.

1. To use secrets, create a `quote.txt` file containing the values you want set:

    ```text
    Better lock it in your pocket.
    ```

1. Then add the secret to your `docker-compose.yml` file:

    ```yaml
    ---
    version: "3.7"

    secrets:
      quote_txt:
        file: quote.txt

    services:
      example:
        image: cisagov/example:0.0.1
        volumes:
          - type: bind
            source: <your_log_dir>
            target: /var/log
        environment:
          - ECHO_MESSAGE="Hello from docker-compose"
        ports:
          - target: 8080
            published: 8080
            protocol: tcp
        secrets:
          - source: quote_txt
            target: quote.txt
    ```

## Updating your container ##

### Docker Compose ###

1. Pull the new image from Docker hub:

    ```console
    docker-compose pull
    ```

1. Recreate the running container by following the [previous instructions](#running-with-docker-compose):

    ```console
    docker-compose up --detach
    ```

### Docker ###

1. Stop the running container:

    ```console
    docker stop <container_id>
    ```

1. Pull the new image:

    ```console
    docker pull cisagov/example:0.0.1
    ```

1. Recreate and run the container by following the [previous instructions](#running-with-docker).

## Image tags ##

The images of this container are tagged with [semantic
versions](https://semver.org) of the underlying example project that they
containerize.  It is recommended that most users use a version tag (e.g.
`:0.0.1`).

| Image:tag | Description |
|-----------|-------------|
|`cisagov/example:1.2.3`| An exact release version. |
|`cisagov/example:1.2`| The most recent release matching the major and minor version numbers. |
|`cisagov/example:1`| The most recent release matching the major version number. |
|`cisagov/example:edge` | The most recent image built from a merge into the `develop` branch of this repository. |
|`cisagov/example:nightly` | A nightly build of the `develop` branch of this repository. |
|`cisagov/example:latest`| The most recent release image pushed to a container registry.  Pulling an image using the `:latest` tag [should be avoided.](https://vsupalov.com/docker-latest-tag/) |

See the [tags tab](https://hub.docker.com/r/cisagov/example/tags) on Docker
Hub for a list of all the supported tags.
>>>>>>> b1949f9b301eef109150dfcb1febfa376e3997d8

Stop containers

<<<<<<< HEAD
* `make stop`

Remove containers
=======
| Mount point | Purpose        |
|-------------|----------------|
| `/var/log`  |  Log storage   |

## Ports ##

The following ports are exposed by this container:

| Port | Purpose        |
|------|----------------|
| 8080 | Example only; nothing is actually listening on the port |

The sample [Docker composition](docker-compose.yml) publishes the
exposed port at 8080.

## Environment variables ##

### Required ###

There are no required environment variables.

<!--
| Name  | Purpose | Default |
|-------|---------|---------|
| `REQUIRED_VARIABLE` | Describe its purpose. | `null` |
-->

### Optional ###

| Name  | Purpose | Default |
|-------|---------|---------|
| `ECHO_MESSAGE` | Sets the message echoed by this container.  | `Hello World from Dockerfile` |

## Secrets ##

| Filename     | Purpose |
|--------------|---------|
| `quote.txt` | Replaces the secret stored in the example library's package data. |

## Building from source ##

Build the image locally using this git repository as the [build context](https://docs.docker.com/engine/reference/commandline/build/#git-repositories):

```console
docker build \
  --build-arg VERSION=0.0.1 \
  --tag cisagov/example:0.0.1 \
  https://github.com/cisagov/example.git#develop
```

## Cross-platform builds ##

To create images that are compatible with other platforms, you can use the
[`buildx`](https://docs.docker.com/buildx/working-with-buildx/) feature of
Docker:

1. Copy the project to your machine using the `Code` button above
   or the command line:

    ```console
    git clone https://github.com/cisagov/example.git
    cd example
    ```

1. Create the `Dockerfile-x` file with `buildx` platform support:

    ```console
    ./buildx-dockerfile.sh
    ```

1. Build the image using `buildx`:

    ```console
    docker buildx build \
      --file Dockerfile-x \
      --platform linux/amd64 \
      --build-arg VERSION=0.0.1 \
      --output type=docker \
      --tag cisagov/example:0.0.1 .
    ```

## New repositories from a skeleton ##
>>>>>>> b1949f9b301eef109150dfcb1febfa376e3997d8

* `make down`

## To access the Angular app ##

Angular app located at [localhost:4200](http://localhost:4200)
