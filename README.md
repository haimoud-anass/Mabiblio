# MAbiblio

## Description

MAbiblio is a full-stack web application for managing a library system. The project is structured with separate backend and frontend components, providing a modern and efficient solution for library management.

## Technologies Used

This project is built using the following technologies:

- **Backend:** Python
- **Frontend:**
  - JavaScript (58.5%)
  - CSS (16.0%)
  - HTML (15.4%)
- **Environment Management:** Python virtual environment

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/haimoud-anass/Mabiblio.git
   ```

2. Navigate to the project directory:

   ```bash
   cd MAbiblio
   ```

3. Set up the environment and install dependencies:

   ```bash
   # Set up Python virtual environment
   python -m venv env
   source env/bin/activate  # On Windows use `env\Scripts\activate`

   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   cd ..

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

## How to Run

- **Backend:**

  ```bash
  cd backend
  python app.py  # or the main application file
  ```

- **Frontend:**
  ```bash
  cd frontend
  npm start  # or the appropriate start command
  ```

## Project Structure

```
MAbiblio/
├── backend/         # Python backend application
├── frontend/        # Frontend application (JavaScript/HTML/CSS)
└── env/            # Python virtual environment
```

## Contributing

Feel free to contribute to this project by:

1. Forking the repository
2. Creating a new branch
3. Making your changes
4. Submitting a pull request

## License

This project is open source and available under the MIT License.
