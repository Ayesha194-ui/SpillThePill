import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import drugRoutes from "./routes/drugRoutes";
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use("/api/drugs", drugRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

