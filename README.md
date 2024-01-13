# To-Do List Web Application with Monitoring Dashboard

## Introduction

This project aims to deliver a user-friendly To-Do List Web Application coupled with a robust Monitoring Dashboard powered by Prometheus and Grafana. Bridging the gap between task management and performance insights, the application provides a seamless experience for users.

## Features

- **Web Application:**
  - Minimalistic To-Do List designed with HTML, CSS, and JavaScript.
  - Server-side logic implemented with Node.js and Express.
  - Registration, authentication, task management, and user-specific routes.
  - Integration of SQLite database for data storage and retrieval.

- **Monitoring Dashboard:**
  - Utilizes Prometheus for basic metric collection.
  - Grafana visualizes metrics on an intuitive dashboard.
  - Deployment orchestrated with Docker Compose.
  - Clear deployment steps documented for Node Exporter, Prometheus, and Grafana.

## Deployment Steps

1. **Node Exporter:**
   - Ensure Docker Compose is installed.
   - Create Docker volume for Node Exporter.
   - Copy the content from `node-exporter/docker-compose.yml` to the stack web editor in Portainer.
   - Deploy the stack.

2. **Prometheus:**
   - Create Docker volume for Prometheus data.
   - Run Prometheus container with Docker Compose.
   - Check Node Exporter status at http://localhost:9090.

3. **Grafana:**
   - Create Docker volume for Grafana data.
   - Run Grafana container with Docker Compose.
   - Access Grafana at http://localhost:3000.
   - Login with credentials: admin/admin.
   - Configure Prometheus data source: http://IP:9090.
   - Import the dashboard with ID 1860.

## Database Integration

The application leverages an SQLite database for robust data storage. Two tables, 'users' and 'tasks,' capture user credentials and task-related information, respectively. The integration ensures data consistency and persistence.

## Challenges Faced

During the realization of this project, several challenges were encountered, including:

- **Code Instrumentation:**
  - Overcoming technical challenges in instrumenting the code for metric collection.
  - Addressing dependencies on external libraries.

- **User Authentication:**
  - Ensuring secure user authentication with hashed passwords.
  - Implementing session management for a seamless user experience.

- **Deployment Configuration:**
  - Configuring Docker Compose for seamless deployment of the entire stack.
  - Ensuring persistent data storage with Docker volumes.

## Conclusion

Despite the encountered challenges, the project successfully delivers a comprehensive solution, seamlessly integrating task management with performance monitoring. The combination of a minimalistic To-Do List Web Application and an insightful Monitoring Dashboard creates a harmonious user experience.

## License

This project is licensed under the [MIT License](LICENSE).
