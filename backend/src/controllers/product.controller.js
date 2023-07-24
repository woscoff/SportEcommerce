import { findProductById, insertProducts, updateProduct, deleteProduct, paginateProducts } from "../services/productServices.js";

// Error handling imports
import CustomError from "../utils/errors/customError.js";

export const getProducts = async (req, res) => {
    let { limit = 10, page = 1, category = undefined, stock = undefined, sort = undefined } = req.query;

    try {
        // Checking wrong params
        if (isNaN(page)) throw new Error("Parameter 'page' must be type: number")

        // Pagination filter and options
        let filter = {} // Contains category and stock filters
        if (category) filter.category = category
        if (stock) filter.stock = { $gt: stock - 1 }

        const options = {
            page,
            limit,
            sort: sort && Object.keys(sort).length ? sort : undefined
        };

        // Sorting definition, if no parameter is received, do not sort
        if (sort != undefined) {
            if (sort != "ASC" && sort != "DESC") {
                throw new Error("Invalid sorting parameter")
            } else {
                sort == "ASC" ? options.sort = "price" : options.sort = "-price"
            }
        }

        const products = await paginateProducts(filter, options)

        if ((page > products.totalPages) || (page <= 0)) throw new Error("Parameter 'page' is out of range")

        // Creating links to prev and next pages
        const categoryLink = category ? `&category=${category}` : ""
        const stockLink = stock ? `&stock=${stock}` : ""
        const limitLink = limit ? `&limit=${limit}` : ""
        const sortLink = sort ? `&sort=${sort}` : ""
        const prevPageLink = products.hasPrevPage ? `/api/products?page=${products.prevPage}${limitLink}${categoryLink}${stockLink}${sortLink}` : null
        const nextPageLink = products.hasNextPage ? `/api/products?page=${products.nextPage}${limitLink}${categoryLink}${stockLink}${sortLink}` : null

        res.status(200).send({
            status: "success",
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: prevPageLink,
            nextLink: nextPageLink
        })

    } catch (error) {
        req.logger.error(`Error on getProducts controller - ${error.message}`)
        res.status(500).send({
            status: "error",
            error: error.message
        })
    }
}

export const getProduct = async (req, res) => {
    try {
        const product = await findProductById(req.params.pid)
        return res.status(200).send(product)
    } catch (error) {
        res.status(500).send({
            message: `Error during product search`,
            error: error.message
        })
    }
}

export const addProducts = async (req, res, next) => {
    const productsData = req.body

    try {
        const products = await insertProducts(productsData)
        res.status(201).send({
            message: `Product(s) added succesfully`,
            payload: products
        })
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).json({
                error: error.name,
                message: error.message,
            })
        } else {
            res.status(500).send({
                status: `Error creating new products`,
                message: error.message
            })
        }
    }
}

export const modifyProduct = async (req, res) => {
    const productID = req.params.pid
    const productData = req.body

    try {
        const product = await updateProduct(productID, productData)
        if (product) {
            return res.status(200).send(`Product up-to-date`)
        }
        return res.status(404).send(`Product not found`)

    } catch (error) {
        res.status(500).send({
            status: `Error on updating product`,
            message: error.message
        })
    }
}

export const removeProduct = async (req, res) => {
    const productID = req.params.pid
    try {
        const product = await deleteProduct(productID)
        if (product) {
            return res.status(200).send({
                status: `success`,
                message: `Product ${product.title} [CODE: ${product.code}] deleted`
            })
        }
        return res.status(404).send(`Product not found`)
    } catch (error) {
        res.status(500).send({
            message: `Error on deleting product`,
            error: error.message
        })
    }
}

