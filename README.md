# EduGenie

A simple education management application.

## Getting Started

Follow these steps to set up and run EduGenie:

1. **System Setup**
    - Install Node.js (v14 or higher)
    - Install Python 3.8+
    - Install MongoDB and start the service
    - Install npm (v6 or higher)

2. **Project Setup**
    ```bash
    # Clone repository
    git clone https://github.com/Ironsupr/EduGenie.git
    cd EduGenie

    # Install dependencies
    npm install

    # Create .env file
    echo "PORT=3000
    MONGODB_URI=mongodb://localhost:27017/edugenie" > .env
    ```

3. **Running the Application**
    ```bash
    # Terminal 1: Start Frontend
    npm run dev

    # Terminal 2: Start Backend
    uvicorn main:app --reload
    ```

4. **Access the Application**
    - Frontend: http://localhost:3000
    - API: http://localhost:8000

## Testing
```bash
npm test
```

## License

MIT
