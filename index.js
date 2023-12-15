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
    "Fantasy",
    "Other"
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
    const mode = req.body.mode;
    // const userId = req.body.user;
    const userId = req.body.userId;
    console.log("IDDDD---> ", userId)
    const clickedUser = (await getClickedUser(userId)).rows;
    const title = req.body.title;
    const author = req.body.author;
    const genreValue = req.body.genre;
    const startDate = req.body.startDate;
    const todayStart = req.body.todayStart;
    const isFinish = req.body.isFinish;
    const bookReview = req.body.bookReview;
    let endDate = (isFinish === 'isFinish') ? req.body.endDate : undefined;
    let todayEnd = (isFinish === 'isFinish') ? req.body.todayEnd : undefined;
    const users = (await getAllUsersData()).rows;
    const review = await db.query(
        "SELECT review FROM books WHERE user_id = $1", [userId]);
    const stars = await db.query(
        "SELECT stars FROM books WHERE user_id = $1", [userId]);
    if(req.body.add == "new"){
        res.redirect("/add_user");
    } else if (req.body.remove == "cancel") {
        res.render("remove.ejs", {
            users:      users,
        });
    }
    console.log("PROVA: ")
        console.log('Title:', title);
        console.log('Author:', author);
        console.log('Genre Value:', genreValue);
        console.log('Start Date:', startDate);
        console.log('Today Start:', todayStart);
        console.log('Is Finish:', isFinish);
        console.log('End Date:', endDate);
        console.log('Today End:', todayEnd);
        console.log('Book Review:', bookReview);

        if (todayStart === 1) {
            startDate = undefined;
        }
        console.log('GEGGE--> ', startDate);

    if (userId && title && author && genreValue && (startDate || todayStart) && !isFinish) {
        console.log("I VALORI SONO: ")
        console.log('Title:', title);
        console.log('Author:', author);
        console.log('Genre Value:', genreValue);
        console.log('Start Date:', startDate);
        console.log('Today Start:', todayStart);
        console.log('Is Finish:', isFinish);
        console.log('End Date:', endDate);
        console.log('Today End:', todayEnd);
        console.log('Book Review:', bookReview);
        console.log("SASDSA")
        const stars = await db.query(
            "SELECT stars FROM books WHERE user_id = $1", [userId]);
        const books = await db.query(
            "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
        );
        try {
            if (startDate) {
            await db.query (
                "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                "VALUES($1, $2, $3, CASE WHEN $4 = 1 THEN NOW() ELSE $5 END, NOW(), NOW(), $6)",
                    [userId, title, genreValue, todayStart, startDate, author]);
            res.render("user.ejs", {
                name:           clickedUser[0].name,
                id:             userId,
                title :         title,
                author:         author,
                genres:         genres,
                genreValue:     genreValue,
                startDate:      startDate,
                todayStart:     todayStart,
                books:          books.rows,
                stars:          stars.rows,
            });
        } else {
            console.log("SONO QUI")
            await db.query (
                "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                "VALUES($1, $2, $3, NOW(), NOW(), NOW(), $4)",
                    [userId, title, genreValue, author]);
            res.render("user.ejs", {
                name:           clickedUser[0].name,
                id:             userId,
                title :         title,
                author:         author,
                genres:         genres,
                genreValue:     genreValue,
                startDate:      startDate,
                todayStart:     todayStart,
                books:          books.rows,
                stars:          stars.rows,
            });
        }
        } catch (err) {
            console.log(err);
        }
    }
    else if(userId && title && genreValue && startDate && author && endDate && review && isFinish){
        try {
            await db.query (
                "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                "VALUES($1, $2, $3, CASE WHEN $4 = 1 THEN NOW() ELSE $5 END, NOW(), NOW(), CASE WHEN $6 = 1 THEN NOW() ELSE $7, $8, $9)",
                    [userId, title, genreValue, todayStart, startDate, isFinish, endDate, review, author]);
            res.render("user.ejs", {
                id:             userId,
                genres:         genres,
                title :         title,
                genreValue:     genreValue,
                startDate:      startDate,
                todayStart:     todayStart
            });
        } catch (error) {
            console.log(err);
        }
    }
    else if (mode) {
        res.render("add_book.ejs", {
            id:             userId,
            genres:         genres,
            // title :         title,
            // genreValue:     genreValue,
            // startDate:      startDate,
            // todayStart:     todayStart
        });
    }
    else {
        try {
            const books = await db.query(
                "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
                );


                res.render("user.ejs", {
                    name:       clickedUser[0].name,
                    id:         userId,
                    books:      books.rows,
                    review:     review.rows,
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
    const clickedUser = (await getClickedUser(userId)).rows;
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
            name:       clickedUser[0].name,
            id:         clickedUser[0].id,
            books:      books.rows,
            stars:      stars.rows,
            genres:     genres,
        });
    } catch (err) {
        console.log(err);
    }
})

app.post("/add_book", async (req, res) => {
    const userId = req.body.userId;
    const clickedUser = (await getClickedUser(userId)).rows;
    const title = req.body.title;
    const author = req.body.author;
    const genreValue = req.body.genre;
    const startDate = req.body.startDate;
    const todayStart = req.body.todayStart;
    const isFinish = req.body.isFinish;
    const bookReview = req.body.bookReview;
    let endDate = (isFinish === 'isFinish') ? req.body.endDate : undefined;
    let todayEnd = (isFinish === 'isFinish') ? req.body.todayEnd : undefined;
    console.log('userId', userId)
    console.log('Title:', title);
    console.log('Author:', author);
    console.log('Genre Value:', genreValue);
    console.log('Start Date:', startDate);
    console.log('Is Finish:', isFinish);
    console.log('Today Start:', todayStart);
    console.log('End Date:', endDate);
    console.log('Today End:', todayEnd);
    console.log('Book Review:', bookReview);
    console.log('*****');
    if (userId && title && author && genreValue && startDate && !isFinish){
        console.log("I VALORI SONO: ")
        console.log('Title:', title);
        console.log('Author:', author);
        console.log('Genre Value:', genreValue);
        console.log('Start Date:', startDate);
        console.log('Today Start:', todayStart);
        console.log('Is Finish:', isFinish);
        console.log('End Date:', endDate);
        console.log('Today End:', todayEnd);
        console.log('Book Review:', bookReview);
        console.log("SASDSA")
        const stars = await db.query(
            "SELECT stars FROM books WHERE user_id = $1", [userId]);
        const books = await db.query(
            "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
        );
        console.log("LIBRI--> ", books.rows)
        console.log("STELLE--> ", stars.rows)
        try {
            await db.query (
                "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                "VALUES($1, $2, $3, CASE WHEN $4 = 1 THEN NOW() ELSE $5 END, NOW(), NOW(), $6)",
                    [userId, title, genreValue, todayStart, startDate, author]);
            res.render("user.ejs", {
                name:           clickedUser[0].name,
                id:             userId,
                title :         title,
                author:         author,
                genres:         genres,
                genreValue:     genreValue,
                startDate:      startDate,
                todayStart:     todayStart,
                books:          books.rows,
                stars:          stars.rows,
            });
        } catch (error) {
            console.log(err);
        }
    }
    else if(userId && title && genreValue && startDate && author && endDate && review && isFinish){
        try {
            await db.query (
                "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                "VALUES($1, $2, $3, CASE WHEN $4 = 1 THEN NOW() ELSE $5 END, NOW(), NOW(), CASE WHEN $6 = 1 THEN NOW() ELSE $7, $8, $9)",
                    [userId, title, genreValue, todayStart, startDate, isFinish, endDate, review, author]);
            res.render("user.ejs", {
                id:             userId,
                genres:         genres,
                title :         title,
                genreValue:     genreValue,
                startDate:      startDate,
                todayStart:     todayStart
            });
        } catch (error) {
            console.log(err);
        }
    }
    res.render("add_book.ejs", {
        id:             userId,
        genres:         genres,
        // title :         title,
        // genreValue:     genreValue,
        // startDate:      startDate,
        // todayStart:     todayStart
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
