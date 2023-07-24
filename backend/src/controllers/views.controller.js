//import { getProducts } from "./product.controller.js"

import { Roles } from "../middlewares/session.js"

const PRODUCTS_URL = 'http://localhost:8080/api/products'
const CARTS_URL = 'http://localhost:8080/api/carts'

export const viewLogin = async (req, res, next) => {

  const message = req.session.message
  delete req.session.message

  if (req.session.user) {
    res.redirect('/products')
  } else {
    res.render('login', { message })
  }

}

export const viewRegister = (req, res) => {
  const message = req.session.message
  delete req.session.message
  res.render('register', { message })
}

export const viewForgot = async (req, res) => {
  res.render('forgotPassword')
}

export const viewReset = async (req, res) => {
  res.render('resetPassword')
}

export const viewCart = async (req, res) => {
  try {
    const response = await fetch(`${CARTS_URL}/${req.params.cid}`)
    const data = await response.json()

    const { status, payload } = data

    let products = []
    for (const item of payload.products) {
      products.push({
        title: item.productId.title,
        description: item.productId.description,
        price: item.productId.price,
        quantity: item.quantity
      })
    }

    res.render('carts', {
      status,
      products,
      cartID: req.params.cid
    })
  } catch (error) {
    res.render("carts", {
      status: "error",
      message: "Cart not found",
    });
  }
}

export const viewChat = async (req, res) => {
  res.render('chat')
}

export const renderProducts = async (req, res) => {
  try {
    let { limit = 10, page = 1, category = undefined, stock = undefined, sort = undefined } = req.query;

    // Get session data prior to continue
    const userFirst = req.session.user.first_name
    let userRole = req.session.user.role
    userRole = userRole === 1 ? 'Usuario' : 'Admin'
    req.logger.debug(`user data: ${userFirst}: ${userRole}`)

    // Creating links to prev and next pages
    const categoryLink = category ? `&category=${category}` : ""
    const stockLink = stock ? `&stock=${stock}` : ""
    const limitLink = limit ? `&limit=${limit}` : ""
    const sortLink = sort ? `&sort=${sort}` : ""
    const pageLink = page ? `&page=${page}` : ""

    req.logger.debug(`fetching: ${PRODUCTS_URL}?${categoryLink}${stockLink}${limitLink}${sortLink}${pageLink}`)
    const response = await fetch(`${PRODUCTS_URL}?${categoryLink}${stockLink}${limitLink}${sortLink}${pageLink}`)
    req.logger.debug(`resp: ${response}`)
    const data = await response.json()
    req.logger.debug(`data: ${data} `)

    //const data = await getProducts(req, res)

    const { status, payload, totalPages, prevPage, nextPage, actualPage, hasPrevPage, hasNextPage, prevLink, nextLink } = data

    let statusBool = status === "success" ? true : false

    res.render('products', {
      statusBool,
      payload,
      totalPages,
      prevPage,
      nextPage,
      actualPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      user: {
        name: userFirst,
        role: userRole
      }
    })

  } catch (error) {
    req.logger.error(`Error while loading products view - ${error.message}`)
    res.render('products', {
      status: "error",
      payload: error
    })

  }
}