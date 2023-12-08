### 1\. Node.js and Nest CLI Installation

Make sure you have [Node.js](https://nodejs.org/) installed on your computer. Then, globally install Nest CLI by running the following command in the terminal:

bashCopy code

`npm install -g @nestjs/cli`

### 2\. Downloading the Project Source Code

Download the Nest.js project source code, for example, using Git:

bashCopy code

`git clone https://github.com/pawell24/TimeTracker.git`

### 3\. Navigate to the Project Directory

Navigate to the project directory using the terminal:

bashCopy code

`cd TimeTracker`

### 4\. Installing Dependencies

Run the following command to install all project dependencies:

bashCopy code

`npm install`

### 5\.Database Configuration

1. Open the `src/app.module.ts` file.

2. Locate the `TypeOrmModule.forRoot` function call within the `imports` array.

3. Modify the `TypeOrmModule.forRoot` configuration according to your database settings:

   ```typescript
   TypeOrmModule.forRoot({
     type: 'postgres',
     host: 'your_database_host', // Change to your PostgreSQL database host
     port: 5432, // Change to your PostgreSQL database port
     username: 'your_database_user', // Change to your PostgreSQL database username
     password: 'your_database_password', // Change to your PostgreSQL database password
     database: 'your_database_name', // Change to your PostgreSQL database name
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
     synchronize: true,
   });
   ```

### 6\. Running the Project

After the dependencies installation is complete, you can start the project by running:

bashCopy code

`npm run start`

or if you want to monitor changes and automatically restart the server:

bashCopy code

`npm run start:dev`

### 7\. Checking the Functionality

Open your web browser and go to [http://localhost:3000](http://localhost:3000/) (or another port if you customized the configuration).
