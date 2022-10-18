# Readme

"Minimalized" version of Unitys Render Streaming web application.

Standard node project so, just type the following and you're good to go:

````shell
npm install
npm run dev
````

Or for the full build:

````shell
npm run build
npm run start
````

## Docker

Or build the Image if required.

````shell
docker build -t render-streaming .
````

Run the image...

````shell
docker run -d -p 80:80 -name Render-Streaming-Server render-streaming
````
