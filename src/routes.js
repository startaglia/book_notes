import { getAllUsersData, getClickedUser, getBookData } from "./dataAccess.js"
import { db } from "./db.js"
import { genres } from "./index.js"
import { log } from "./utils.js"

async function configureRoutes(db, app) {
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
        try {
            await db.query(
                "INSERT INTO users(name, color) VALUES ($1, $2)", [name, color]);
                res.redirect("/");
        } catch (err) {
            log('red', err)
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
            res.redirect("/");
        } catch (err) {
            log('red', err)
        }
    })

    app.get("/user", async (req, res) => {
        res.render("user.ejs");
    });

    app.post("/user", async (req, res) => {
        const { userId, title, author, genre, startDate, todayStart, isFinish, bookReview, modify, bookId } = req.body;
        const clickedUser = (await getClickedUser(userId)).rows;
        let endDate = (isFinish) ? req.body.endDate : undefined;
        let todayEnd = (isFinish) ? req.body.todayEnd : undefined;
        if(req.body.add == "new"){
            res.redirect("/add_user");
        } else if (req.body.remove == "cancel") {
            const users = (await getAllUsersData()).rows;
            res.render("remove.ejs", { users: users });
        }
        if (todayStart === 1) startDate = undefined;
        if (todayEnd === 1) endDate = undefined;
        // CASO IN CUI VADO A MODIFICARE UN LIBRO
        if (modify) {
            endDate = req.body.endDate
            todayEnd = req.body.todayEnd
            try {
                if (todayEnd !== 'todayEnd') {
                    await db.query("UPDATE books SET title = $1, author = $2, genre = $3, start_date = $4, last_modified = CURRENT_TIMESTAMP, finish_date = $5, review = $6 WHERE id = $7", [title, author, genre, startDate, endDate, bookReview, bookId]);
                } else {
                    await db.query("UPDATE books SET title = $1, author = $2, genre = $3, start_date = $4, last_modified = CURRENT_TIMESTAMP, finish_date = NOW(), review = $5 WHERE id = $6", [title, author, genre, startDate, bookReview, bookId]);
                }
                    const books = await db.query(
                        "SELECT * FROM books WHERE user_id = $1 ORDER BY last_modified DESC", [userId]);

                res.render("user.ejs", {
                    name:           clickedUser[0].name,
                    id:             userId,
                    books:          books.rows,
                    title:          title,
                    author:         author,
                    genres:         genres,
                    clickedGenre:   genre,
                    startDate:      startDate,
                    endDate:        endDate,
                    review:         bookReview,
                    modify:         modify,
                });
            } catch (err) {
                console.log(err);
            }
        }
        // CASO IN CUI IL LIBRO NON È ANCORA STATO FINITO
        else if (userId && title && author && genre && (startDate || todayStart) && !isFinish) {
            try {
                if (startDate) {
                await db.query (
                    "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                    "VALUES($1, $2, $3, $4, NOW(), NOW(), $5)",
                        [userId, title, genre, startDate, author]);
                } else {
                    await db.query (
                        "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, author)" +
                        "VALUES($1, $2, $3, NOW(), NOW(), NOW(), $4)",
                            [userId, title, genre, author]);
                }
                const books = await db.query(
                    "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
                );
                res.render("user.ejs", {
                    name:           clickedUser[0].name,
                    id:             userId,
                    genres:         genres,
                    books:          books.rows,
                });
            } catch (err) {
                log.red(err)
            }
        }
        // CASO IN CUI IL LIBRO È STATO FINITO
        else if(userId && title && author && genre && (startDate || todayStart) && isFinish && (endDate || todayEnd) && bookReview){
            try {
                if (endDate && !todayStart) {
                    await db.query(
                        "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, finish_date, review, author)" +
                        "VALUES($1, $2, $3, $4, NOW(), NOW(), $5, $6, $7)",
                        [userId, title, genre, startDate, endDate, bookReview, author]
                    );
                } else if (endDate && todayStart) {
                    await db.query(
                        "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, finish_date, review, author)" +
                        "VALUES($1, $2, $3, NOW(), NOW(), NOW(), $4, $5, $6)",
                        [userId, title, genre, endDate, bookReview, author]
                    );
                } else if(!endDate && !todayStart) {
                    await db.query (
                        "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, finish_date, review, author)" +
                        "VALUES($1, $2, $3, $4, NOW(), NOW(), NOW(), $5, $6)",
                            [userId, title, genre, startDate, bookReview, author]);
                } else if (!endDate && todayStart) {
                    await db.query(
                        "INSERT INTO books (user_id, title, genre, start_date, created_at, last_modified, finish_date, review, author)" +
                        "VALUES($1, $2, $3, NOW(), NOW(), NOW(), NOW(), $4, $5)",
                        [userId, title, genre, bookReview, author]);
                }
                const books = await db.query(
                    "SELECT * FROM books WHERE user_id = $1 ORDER BY last_modified DESC", [userId]
                );
                res.render("user.ejs", {
                    name:           clickedUser[0].name,
                    id:             userId,
                    genres:         genres,
                    books:          books.rows,
                });
            } catch (err) {
                log.red(err)
            }
        }
        // CASO IN CUI VADO DA INDEX.EJS A USER.EJS
        else {
            try {
                const books = await db.query(
                    "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
                    );
                res.render("user.ejs", {
                    name:       clickedUser[0].name,
                    id:         userId,
                    books:      books.rows,
                    genres:     genres,
                })
            } catch (err) {
                log.red(err)
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
            const books = await db.query(
                "SELECT * FROM books WHERE user_id = $1 ORDER BY last_modified DESC", [userId]);
            res.render("user.ejs", {
                name:       clickedUser[0].name,
                id:         userId,
                books:      books.rows,
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
                genres:     genres,
            });
        } catch (err) {
            console.log(err);
        }
    })

    app.post("/book_page", async (req, res) => {
        const { userId, bookId, modify, endDate } = req.body;
        const clickedUser = (await getClickedUser(userId)).rows;
        if (modify) {
            if (!endDate) {

            }
            const selectedBook = (await getBookData(bookId)).rows
            log.red(
                clickedUser[0].name + '\n',
                userId + '\n',
                bookId + '\n',
                selectedBook[0] + '\n',
                JSON.stringify(selectedBook[0].finish_date, null, 2) + '\n',
                genres + '\n',
                selectedBook[0].genre + '\n',
                modify + '\n'
            );

            res.render("book_page.ejs", {
                name:           clickedUser[0].name,
                id:             userId,
                bookId:         bookId,
                selectedBook:   selectedBook[0],
                genres:         genres,
                clickedGenre:   selectedBook[0].genre,
                modify:         modify
            });
        }
        else {
            const selectedBook = (await getBookData(bookId)).rows
            log.yellow("NON MODIFY", modify)
            res.render("book_page.ejs", {
                name:           clickedUser[0].name,
                id:             userId,
                bookId:         bookId,
                selectedBook:   selectedBook[0],
                genres:         genres,
                modify:         modify
            });
        }
    });

    app.post("/delete", async (req, res) => {
        const { userId, bookId } = req.body;
        const clickedUser = (await getClickedUser(userId)).rows;
        await db.query("DELETE from books WHERE id = $1", [bookId])
        const books = await db.query(
            "SELECT * FROM books WHERE user_id = $1  ORDER BY last_modified DESC", [userId]
        );
        res.render("user.ejs", {
            name:           clickedUser[0].name,
            id:             userId,
            genres:         genres,
            books:          books.rows,
            genres:         genres,
        });
    });
}

export { configureRoutes };
