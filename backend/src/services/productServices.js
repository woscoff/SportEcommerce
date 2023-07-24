import productModel from "../models/MongoDB/productModel.js";
import CustomError from "../utils/errors/customError.js";
import { EErrors } from "../utils/errors/enums.js";
import { generateProductErrorInfo } from "../utils/errors/info.js";

export const findProducts = async () => {
    try {
        return await productModel.find();
    } catch (error) {
        throw new Error(error);
    }
}

export const findProductById = async (id) => {
    try {
        return await productModel.findById(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const paginateProducts = async (filters, options) => {
    try {
        return await productModel.paginate(filters, options);
    } catch (error) {
        throw new Error(error);
    }
}

export const insertProducts = async (products) => {
    try {
        if (Array.isArray(products)) {
            products.forEach(product => validateProductData(product));
        }
        // Validating single product
        validateProductData(products);
        return await productModel.insertMany(products);
    } catch (error) {
        throw error;
    }
}

export const deleteProduct = async (id) => {
    try {
        return await productModel.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const updateProduct = async (id, info) => {
    try {
        return await productModel.findByIdAndUpdate(id, info);
    } catch (error) {
        throw new Error(error);
    }
}

const validateProductData = (productData) => {
    if (!productData.title || !productData.description || !productData.code || !productData.price || !productData.stock || !productData.category) {
        CustomError.createError({
            name: `Product creation error`,
            cause: generateProductErrorInfo(productData),
            message: `Error trying to create a new product`,
            code: EErrors.REQUIRED_ERROR
        })
    }
}