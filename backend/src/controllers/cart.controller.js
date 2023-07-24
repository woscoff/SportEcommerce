import productModel from "../models/MongoDB/productModel.js"
import { findCartById, updateCart, createCart, removeFromCart } from "../services/cartServices.js"
import { findProductById, updateProduct } from "../services/productServices.js"

import { createTicket } from "../services/ticketServices.js"

export const getCart = async (req, res) => {
  if (req.session.login) {
    try {
      const cartID = req.session.user.cart_id

      const cart = await findCartById(cartID)
      if (!cart) {
        throw new Error("Cart not found")
      }
      const popCart = await cart.populate({ path: 'products.productId', model: productModel })

      res.status(200).send({ cart: popCart })

    } catch (error) {
      res.status(500).send({
        status: 'error',
        message: error.message
      })
    }
  } else {
    return res.status(401).send("No active session")
  }
}

export const createNewCart = async (req, res) => {
  try {
    req.logger.http(`POST on /api/carts`)
    const newCart = {}
    const data = await createCart(newCart)

    res.status(201).send({
      status: "success",
      payload: data
    })

  } catch (error) {
    req.logger.error(error.message)
    res.status(500).send({
      status: "error",
      message: error.message
    })
    //console.log(error)
  }
}

export const addProduct = async (req, res) => {
  if (req.session.login) {
    try {
      const cartID = req.session.user.cart_id
      const productID = req.params.pid

      const foundProduct = await findProductById(productID)
      if (foundProduct) {
        const cart = await findCartById(cartID)
        const productIndex = cart.products.findIndex(prod => prod.productId.equals(productID))

        productIndex === -1 ? cart.products.push({ productId: productID }) : cart.products[productIndex].quantity++

        await cart.save()
        return res.status(201).send(`Product added to cart`)
      }

      return res.status(404).send(`Cannot add product (reason: not found)`)
    } catch (error) {
      res.status(500).send({
        error: error.message
      })
    }
  } else {
    return res.status(401).send("No active session")
  }

}

export const overwriteCart = async (req, res) => {
  if (req.session.login) {
    try {
      const cartID = req.session.user.cart_id
      const productsToAdd = req.body

      const response = await updateCart(cartID, productsToAdd)

      res.status(200).send({
        status: 'success',
        payload: response
      })
    } catch (error) {
      res.status(500).send({
        status: 'error',
        message: error.message
      })
    }
  } else {
    return res.status(401).send("No active session")
  }

}

export const changeProductQuantity = async (req, res) => {
  if (req.session.login) {
    try {
      const { quantity } = req.body
      const newQuantity = parseInt(quantity)

      const updatedCart = await changeProductQuantity(req.params.cid, req.params.pid, newQuantity)

      res.status(200).send({
        status: "success",
        payload: updatedCart
      })

    } catch (error) {
      res.status(500).send({
        status: "error",
        message: error.message
      })
    }
  } else {
    return res.status(401).send("No active session")
  }
}

export const removeProduct = async (req, res) => {
  try {
    const cart = await removeFromCart(req.params.cid, req.params.pid)

    res.status(200).send({
      status: "success",
      payload: cart
    })
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message
    })
  }
}

export const clearCart = async (req, res) => {
  try {
    const cart = await cartManager.emptyCart(req.params.cid)
    res.status(200).send(`Cart id:${req.params.cid} is now empty`)
  } catch (error) {
    re.status(500).send({
      status: "error",
      message: error.message
    })
  }
}

export const purchaseCart = async (req, res) => {

  if (req.session.login) {
    const cartID = req.session.user.cart_id
    const purchaser = req.session.user.email

    try {
      const cart = await findCartById(cartID)
      const populatedCart = await cart.populate({
        path: "products.productId", model: productModel
      })

      const products = populatedCart.products
      if (products === -1) {
        throw new Error(`Cart empty, unable to continue with the purchase`)
      }

      let totalAmount = 0
      products.forEach(elem => {
        let stockBeforePurchase = parseInt(elem.productId.stock)
        let stockAfterPurchase = stockBeforePurchase - elem.quantity
        let productID = elem.productId._id

        req.logger.debug(`[purchase] product: ${elem.productId.title}`)
        req.logger.debug(`[purchase] stock before: ${stockBeforePurchase}`)
        req.logger.debug(`[purchase] selected quantity: ${elem.quantity}`)
        req.logger.debug(`[purchase] stock after: ${stockAfterPurchase}`)

        if (stockAfterPurchase >= 0) {
          totalAmount += elem.productId.price * elem.quantity
          updateProduct(productID, { stock: stockAfterPurchase })
          /* 
              Products succesfully purchased are removed
              Those with insufficient stock are retained in the cart but not considered in the purchase
          */
          removeFromCart(cartID, productID)
        } else {
          req.logger.info(`[purchase] insufficient stock, returning item "${elem.productId.title}" to the cart`)
        }

      })
      req.logger.debug(`[purchase] total amount: $ ${totalAmount}`)

      if (totalAmount <= 0) {

        return res.status(400).send({
          message: `Purchase cancelled. The products in the cart are unavailable due to stock`,
          cart_content: populatedCart
        })
      }

      const newTicket = await createTicket({
        total_amount: totalAmount,
        purchaser: purchaser
      })

      const savedTicket = await newTicket.save()

      let message
      const finalCart = await findCartById(cartID)
      finalCart.products > 0 ? message = `Purchase completed. Some products were not added due to insufficient stock` : message = `Purchase completed`

      return res.status(201).send({
        message: message,
        invoice: savedTicket
      })
    } catch (error) {
      req.logger.error(error)
      res.status(500).send({
        message: `Error on purchase`,
        error: error
      })
    }
  } else {
    res.status(401).send({
      message: 'No session active',
    })
  }
}