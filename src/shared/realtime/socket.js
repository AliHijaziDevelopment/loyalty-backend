import { Server } from "socket.io";
import { verifyAccessToken } from "../security/keycloak.js";
import { isAllowedAppOrigin } from "../http/origin.js";

let io = null;

function extractToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const headerToken = socket.handshake.headers.authorization;
  const rawToken = typeof authToken === "string" && authToken
    ? authToken
    : typeof headerToken === "string"
      ? headerToken
      : "";

  return rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
}

function getClientRoom(keycloakId) {
  return `client:${keycloakId}`;
}

export function createSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isAllowedAppOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS."));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);

      if (!token) {
        return next(new Error("Socket authentication token is required."));
      }

      socket.data.auth = await verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error("Socket authentication failed."));
    }
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth;

    if (auth?.role === "client" && auth.sub) {
      socket.join(getClientRoom(auth.sub));
    }
  });

  return io;
}

export function getSocketServer() {
  return io;
}

export function emitToClient(keycloakId, eventName, payload) {
  if (!io || !keycloakId) {
    return;
  }

  io.to(getClientRoom(keycloakId)).emit(eventName, payload);
}
