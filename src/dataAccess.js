import { db } from "./db.js"
import { log } from "./utils.js"


async function getAllUsersData() {
    return db.query("SELECT * FROM users");
}
async function getClickedUser(userId) {
    return db.query(
        "SELECT * FROM users WHERE id = $1", [userId]);
}
async function getBookData(bookId) {
    try {
      return db.query(`
      SELECT *
      FROM books
      WHERE id = $1;
    `, [bookId]);
    } catch (error) {
      log.red;
      throw error;
    }
  }
export  {   getAllUsersData,
            getClickedUser,
            getBookData,
        }
