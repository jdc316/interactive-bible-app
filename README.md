# Interactive Bible App

An interactive experience where users can explore the Bible in a hands-on way, search for verses, and save their favorite passages.

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features
- Explore the Bible interactively.
- Search and filter verses by keywords.
- Bookmark and save favorite passages.
- Multi-platform support (web and mobile).

## Demo
Include a link to a live demo or screenshots of the app in action. For example:
- [Live Demo](https://example.com)
- ![App Screenshot](https://via.placeholder.com/800x400)

## Getting Started
Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (for the front-end)
- [Angular CLI](https://angular.dev/tools/cli/setup-local#example-1) (for the front-end)
- [.NET SDK](https://dotnet.microsoft.com/) (for the back-end)
- [Ionic CLI](https://ionicframework.com/docs/cli) (for mobile development)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jdc316/interactive-bible-app.git
   cd interactive-bible-app
   ```

2. Install dependencies for the front-end:
   ```bash
   cd front-end
   npm install -g @angular/cli
   npm install -g @ionic/cli
   npm install
   ```

3. Restore dependencies for the back-end:
   ```bash
   cd back-end
   dotnet restore
   ```

## Usage
To run the application locally:
1. Start the back-end server:
   ```bash
   cd back-end
   dotnet run
   ```
2. Start the front-end development server:
   ```bash
   cd front-end
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000` (or the specified port).

## Technologies Used
- **Front-end:** Angular, Ionic Framework
- **Back-end:** .NET Core
- **Database:** SQL Server
- **Other Tools:** Node.js, npm, Ionic CLI

## Contributing
Contributions are welcome! Follow these steps to contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
