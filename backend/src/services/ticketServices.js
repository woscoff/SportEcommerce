import ticketModel from "../models/MongoDB/ticketModel.js";

export const createTicket = async (ticket) => {
    try {
        const newTicket = await ticketModel.create(ticket)
        return newTicket
    } catch (error) {
        throw new Error(error)
    }
}

export const findTicketByCode = async (code) => {
    try {
        const ticket = await ticketModel.findOne({ code: code })
        return ticket
    } catch (error) {
        throw new Error(error)
    }
}

export const findTicketsByPurchaser = async (userEmail) => {
    try {
        const tickets = await ticketModel.find({ purchaser: userEmail })
        return tickets
    } catch (error) {
        throw new Error(error)
    }
}

export const deleteTicket = async (code) => {
    try {
        await ticketModel.findOneAndDelete({ code: code })
    } catch (error) {
        throw new Error(error)
    }
}