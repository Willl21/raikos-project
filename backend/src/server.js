import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Raikos Server] Running securely on port ${PORT}`);
});
