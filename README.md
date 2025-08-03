# CuteComputerCritters


## About the project
This project is a webbased virtual pet game, where you can
create pets and take care of them similar to the tamagotchi games of the 90s.
Additionally, you can see your pet history on your profile page if you create an account.
This game was designed with the goal, that it is free to play and portable.

## Used Technologies
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.13.

Frontend:
* Angular v19.2.13
* TailwindCSS v3

Game Logic:
* PhaserJS

Backend:
* Springboot v3.4.4
* Node.js
* MariaDB as the database

Misc:
* Dockers for Containerizing
* Maven as the build-tool
* Cypress for e2e tests


## Getting Started


This project is a locally hosted project, so you need to install and run it locally.

### Prerequisites
For this project you'll need to install npm and node.js.
### Installation

1. Clone the repo
```
https://github.com/XwX-J0sh/CuteComputerCritters.git
```
2. Navigate to where the frontend is nested and install NPM packages
```
cd .\frontend\critters\

npm i
```
3. Create env file in docker folder


4. Navigate to the docker file in the directory named 'docker' and start docker
```
docker compose up
```
5. Start server and open in browser
```
open http://localhost:4200/ in browser
```
## Usage
Login to see your profile and your information.
To play simply click the "meet your pet" button on the homepage.
Then on the page you choose "Chiikawa" as your critter and congratulations
you've loaded the game!
Hit enter (as described) and either create a new critter or open a previous one
(given that this is a local project, on first time use you'll definitely need to create a new critter).
Then simply select a critter of choice and you can start playing.

## Running tests
In order to run the included e2e tests, you'll need to install cypress.
Start the server and then simply run
```
npx cypress open
```

## License
MIT

## Additional Resources
### Demo Account
User1 and Password1

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
