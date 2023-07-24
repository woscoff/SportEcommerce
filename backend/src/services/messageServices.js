import messageModel from "../models/MongoDB/messageModel.js";

export const createMessage = async (message) => {
    try {
        const newMessage = await messageModel.create(message)
        return newMessage
    } catch (error) {
        throw new Error(error)
    }
}

export const readMessages = async () => {
    try {
        return await messageModel.find()
    } catch (error) {
        throw new Error(error)
    }
}