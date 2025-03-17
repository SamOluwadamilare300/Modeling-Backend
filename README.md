# User Authentication API

## Description

This project implements a **User Authentication API** using **Node.js, Express.js, and SQLite**. The API provides endpoints for user registration, login, and password change. User information is securely stored in a **SQLite database**, with passwords hashed using **bcrypt** for added security.

## Installation

1. Clone the repository:  
   ```sh
   git clone https://github.com/my_username/repository.git
   ```
2. Navigate to the project directory:  
   ```sh
   cd repository
   ```
3. Install the dependencies:  
   ```sh
   npm install
   ```

## Database Setup

1. The database file (`userData.db`) is automatically created when the server starts.
2. The `models` table is created if it does not already exist.

## Usage

1. Start the server:  
   ```sh
   npm start
   ```
2. Use an API testing tool like **Postman** or **cURL** to interact with the API endpoints.

## API Endpoints

### **GET /register**
- **Description:** Fetches all registered users from the database.
- **Response:** An array of user objects.

### **POST /register**
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "skin_color": "Brown",
    "height": 180,
    "email": "johndoe@example.com",
    "location": "New York",
    "gender": "Male",
    "password": "securepassword"
  }
  ```
- **Response:**
  - Success: "Model registered successfully"
  - Error: "Model already exists" or "Password is too short"

### **POST /login**
- **Description:** Authenticates a user.
- **Request Body:**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword"
  }
  ```
- **Response:**
  - Success: "Login successful!"
  - Error: "Invalid email" or "Invalid password"

### **PUT /change-password**
- **Description:** Changes the password for a user.
- **Request Body:**
  ```json
  {
    "email": "johndoe@example.com",
    "oldPassword": "oldpassword",
    "newPassword": "newsecurepassword"
  }
  ```
- **Response:**
  - Success: "Password updated successfully"
  - Error: "Invalid current password" or "New password is too short"

## Dependencies

- **express** – Web framework for Node.js
- **sqlite** – SQLite database driver
- **sqlite3** – SQLite library
- **bcrypt** – Password hashing library
- **path** – Module for handling file paths

## License
This project is open-source and available under the [MIT License](LICENSE).

