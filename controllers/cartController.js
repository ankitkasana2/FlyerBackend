import { db } from "../config/db.js";

// ==================================================
// ADD TO CART
// ==================================================
export const addToCart = async (req, res) => {
  const { user_id, flyer_id } = req.body;

  if (!user_id || !flyer_id) {
    return res.status(400).json({
      success: false,
      message: "user_id and flyer_id are required",
    });
  }

  try {
    // Check if already in cart
    const [existing] = await db.execute(
      `SELECT id FROM cart WHERE user_id = ? AND flyer_id = ? AND status = 'active'`,
      [user_id, flyer_id]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Item is already in your cart",
      });
    }

    // Insert
    await db.execute(
      `INSERT INTO cart (user_id, flyer_id, added_time, status)
       VALUES (?, ?, NOW(), 'active')`,
      [user_id, flyer_id]
    );

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully!",
    });

  } catch (error) {
    console.error("❌ addToCart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================================================
// GET USER CART
// ==================================================
// export const getCart = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const [rows] = await db.execute(
//       `SELECT * FROM cart WHERE user_id = ? AND status = 'active'`,
//       [user_id]
//     );
    

//     res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("❌ getCart error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export const getCart = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM cart 
       WHERE BINARY user_id = ? 
       AND status = 'active'`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("❌ getCart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ==================================================
// REMOVE ITEM FROM CART
// ==================================================
export const removeCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(
      `UPDATE cart SET status = 'removed' WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Cart item removed",
    });

  } catch (error) {
    console.error("❌ removeCartItem error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==================================================
// CLEAR CART
// ==================================================
export const clearCart = async (req, res) => {
  const { user_id } = req.params;

  try {
    await db.execute(
      `UPDATE cart SET status = 'ordered' 
       WHERE user_id = ? AND status = 'active'`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully!",
    });

  } catch (error) {
    console.error("❌ clearCart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
