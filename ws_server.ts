import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { client as db } from "./config/db.ts";

interface ClientInfo {
  socket: WebSocket;
  name: string | null;
}

const clients = new Set<ClientInfo>();

async function handler(req: Request): Promise<Response> {
  const { socket, response } = Deno.upgradeWebSocket(req);
  const client: ClientInfo = { socket, name: null };
  clients.add(client);

  // ✅ When the socket is open, then send history
  socket.addEventListener("open", async () => {
    try {
      const messages = await db.query(
        "SELECT sender_name, message_text, created_at FROM messages ORDER BY id DESC LIMIT 10"
      );
      safeSend(socket, {
        type: "history",
        messages: messages.reverse(),
      });
    } catch (err) {
      console.error("History send error:", err);
    }
  });

  socket.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "set_name") {
        client.name = data.name;
        broadcast({ type: "system", message: `${data.name} joined the chat` });
        updateUsers();

      } else if (data.type === "message") {
        if (!client.name) {
          safeSend(socket, { type: "error", message: "Set your name first" });
          return;
        }

        const msg = data.text.trim();
        if (!msg) return;

        await db.execute(
          "INSERT INTO messages (sender_name, message_text) VALUES (?, ?)",
          [client.name, msg]
        );

        broadcast({
          type: "message",
          from: client.name,
          text: msg,
          ts: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  socket.addEventListener("close", () => {
    clients.delete(client);
    if (client.name) {
      broadcast({ type: "system", message: `${client.name} left the chat` });
      updateUsers();
    }
  });

  return response;
}

// ✅ Broadcast helper
function broadcast(data: any) {
  const msg = JSON.stringify(data);
  for (const c of clients) {
    safeSend(c.socket, msg);
  }
}

// ✅ Safe send (avoid “readyState not OPEN”)
function safeSend(ws: WebSocket, data: any) {
  try {
    const message = typeof data === "string" ? data : JSON.stringify(data);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  } catch (err) {
    console.warn("Safe send failed:", err);
  }
}

function updateUsers() {
  const users = Array.from(clients)
    .filter((c) => c.name)
    .map((c) => ({ name: c.name }));
  broadcast({ type: "users", users });
}

console.log("✅ WebSocket server running on ws://localhost:9090");
serve(handler, { port: 9090 });
