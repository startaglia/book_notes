import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 8000;

const db = new pg.Client({
    user:       "postgres",
    host:       "localhost",
    database:   "book",
    password:   "Enomis198961!",
    port:       5432,
});
db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function getAllUsersData() {
    return db.query("SELECT * FROM users");
}
async function getClickedUser(userId) {
    return db.query(
        "SELECT * FROM users WHERE id = $1", [userId]);
}
const genres = [
    "All",
    "Novel",
    "Classics",
    "Sci-Fi",
    "Thriller",
    "Fantasy"
  ];

app.get("/", async (req, res) => {
    const users = (await getAllUsersData()).rows;
    res.render("index.ejs", {
        users:  users,
    });
});

app.get("/add_user", async (req, res) => {
    res.render("add_user.ejs");
});
app.post("/add_user", async (req, res) => {
    const name = req.body.name;
    const color = req.body.color;
    console.log(name);
    console.log(color);
    try {
        await db.query(
            "INSERT INTO users(name, color) VALUES ($1, $2)", [name, color]);
            res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

app.get("/remove_user", async (req, res) => {
    res.render("remove.ejs")
})
app.post("/remove_user", async (req, res) => {
    const idSelected = req.body.user;
    try {
        await db.query(
            "DELETE FROM users WHERE id = $1", [idSelected]
        );
    } catch (err) {
        console.log(err);
    }
    res.redirect("/");
})

app.get("/user", async (req, res) => {
    res.render("user.ejs");
});
app.post("/user", async (req, res) => {
    const users = (await getAllUsersData()).rows;
    const userId = req.body.user;
    const clickedUser = (await getClickedUser(userId)).rows;
    const stars = await db.query(
        "SELECT stars FROM books WHERE user_id = $1", [userId]);
    if(req.body.add == "new"){
        res.redirect("/add_user");
    } else if (req.body.remove == "cancel") {
        res.render("remove.ejs", {
            users:      users,
        });
    }
    else {
        try {
            const books = await db.query(
                "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
                );
                res.render("user.ejs", {
                    user:       clickedUser,
                    books:      books.rows,
                    stars:      stars.rows,
                    genres:     genres,
                })
        } catch (err) {
            console.log(err)
        }
    }
});

app.post("/rating", async (req, res) =>{
    const newStars = req.body.stars;
    const userId = req.body.id;
    const bookId = req.body.bookid;
    const clickedUser = (await getClickedUser(userId)).rows;
    try {
        await db.query(
            "UPDATE books SET stars = $1, last_modified = CURRENT_TIMESTAMP WHERE user_id = $2 AND id = $3", [newStars, userId, bookId]);
        const stars = await db.query(
            "SELECT stars FROM books WHERE user_id = $1", [userId]);
        const books = await db.query(
            "SELECT * FROM books WHERE user_id = $1 ORDER BY last_modified DESC", [userId]);
        res.render("user.ejs", {
            user:       clickedUser,
            books:      books.rows,
            stars:      stars.rows,
            genres:     genres,

        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/genre", async (req, res) => {
    const newStars = req.body.stars;
    const userId = req.body.id;
    const bookId = req.body.bookid;
    const genre = req.body.genre;
    let books;
    console.log(genre);
    const clickedUser = (await getClickedUser(userId)).rows;
    console.log(userId);

    try {
        await db.query(
            "UPDATE books SET stars = $1, last_modified = CURRENT_TIMESTAMP WHERE user_id = $2 AND id = $3", [newStars, userId, bookId]);
        const stars = await db.query(
            "SELECT stars FROM books WHERE user_id = $1", [userId]);
        if(genre === "All") {
            books = await db.query(
                "SELECT * FROM books WHERE user_id = $1 ORDER BY last_modified DESC", [userId]);
        } else {
            books = await db.query(
                "SELECT * FROM books WHERE user_id = $1 AND genre = $2 ORDER BY last_modified DESC", [userId, genre]);
        }
        res.render("user.ejs", {
            user:       clickedUser,
            books:      books.rows,
            stars:      stars.rows,
            genres:     genres,
        });
    } catch (err) {
        console.log(err);
    }
})

app.post("/add_book", async (req, res) => {
    const genres = req.body.genres;
    res.render("add_book.ejs", {
        genres:      genres,
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
