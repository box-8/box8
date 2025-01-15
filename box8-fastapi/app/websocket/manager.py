from fastapi import WebSocket
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.logger = logger

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            self.logger.info(f"WebSocket disconnected. Remaining connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        self.logger.debug(f"Broadcasting message: {message}")
        if not self.active_connections:
            self.logger.debug("No active WebSocket connections for broadcast")
            return
            
        self.logger.debug(f"Broadcasting to {len(self.active_connections)} connections")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
                self.logger.debug(f"Successfully sent message to connection")
            except Exception as e:
                self.logger.error(f"Error broadcasting message: {str(e)}")
                disconnected.append(connection)
                
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()
