import { areCustomersInputsValid } from "../Utils/joiUtils.js";
import { isNewAtributeAvailable, capitalizeFirstLetters} from "../Utils/sharedFunctions.js";
import { getCustomers } from "./auxCustomersFunctions.js";

async function sendCustomers(connection, req, resp) {
    const requiredId = Number(req.params.id);
    const requiredCpf = req.query.cpf;
    try {
        if (!requiredId) {
            return resp.send(await getCustomers(connection, {cpf: requiredCpf}));
        }
        const customersById = await getCustomers(connection, {id: requiredId});
        if (customersById.length === 0) {
            return resp.sendStatus(404);
        }
        return resp.send(customersById[0]);
    } catch (error) {
        console.log(error);
        resp.sendStatus(500);
    }
 }

 async function postCustomers(connection, req, resp) {
    const {
        name,
        phone,
        cpf,
        birthday
    } = req.body;

    try {
        if (!areCustomersInputsValid(req.body) ) {
            return resp.sendStatus(400);
        }
        if (!(await isNewAtributeAvailable(connection, "cpf", cpf, getCustomers))) {
            return resp.sendStatus(409);
        };
        await connection.query(`INSERT INTO customers ("name", "phone", "cpf", "birthday")` +
        ` VALUES ($1, $2, $3, $4);`,[capitalizeFirstLetters(name), phone, cpf, birthday])
        resp.sendStatus(201);
    } catch (error) {
        console.log(error)
        resp.sendStatus(500)
    }
}

async function updateCustomer(connection, req, resp) {
    const requiredId = Number(req.params.id);
    const {
        name,
        phone,
        cpf,
        birthday
    } = req.body;

    try {
        if (!areCustomersInputsValid(req.body) ) {
            return resp.sendStatus(400);
        }        
        const customersById = await getCustomers(connection, {id: requiredId});
        if (customersById.length === 0) {
            return resp.sendStatus(404);
        }
        const customersWithGivenCpf = await isNewAtributeAvailable(connection, "cpf", cpf, getCustomers, true);
        if (customersWithGivenCpf.length !== 0 && customersWithGivenCpf[0].id !== requiredId) {
            return resp.sendStatus(409);
        };
        await connection.query(`UPDATE customers 
        SET
            "name" = $1,
            "phone" = $2,
            "cpf" = $3,
            "birthday" = $4
        WHERE
            id = $5;
            `,[capitalizeFirstLetters(name), phone, cpf, birthday, requiredId]);
        resp.sendStatus(201);
    } catch (error) {
        console.log(error);
        resp.sendStatus(500);
    }
}

 export {
     sendCustomers,
     postCustomers,
     updateCustomer,
 }