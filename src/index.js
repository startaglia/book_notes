import { express, bodyParser } from "./dependencies.js"
import { db } from "./db.js";
import { configureRoutes } from "./routes.js";

const app = express()
const port = 8000

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("../public"));

export const genres = [
    "All",
    "Novel",
    "Classics",
    "Sci-Fi",
    "Thriller",
    "Fantasy",
    "Other"
  ];

configureRoutes(db, app);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
