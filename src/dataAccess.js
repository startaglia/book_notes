import { db } from "./db.js"
import { log } from "./utils.js"


async function getAllUsersData() {
    return db.query("SELECT * FROM users");
}
async function getClickedUser(userId) {
    return db.query(
        "SELECT * FROM users WHERE id = $1", [userId]);
}
async function getBookData(userId) {
    try {
      return db.query(`
      SELECT *
      FROM books
      WHERE user_id = $1;
    `, [userId]);
    } catch (error) {
      log.red;
      throw error;
    }
  }
export  {   getAllUsersData,
            getClickedUser,
            getBookData,
        }
