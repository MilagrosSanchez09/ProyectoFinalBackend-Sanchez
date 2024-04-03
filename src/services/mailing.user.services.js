import { createTransport } from "nodemailer";
import config from '../config/config.js';
import { logger } from '../utils/logger.js';

const transporter = createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: config.EMAIL,
        pass: config.PASSWORD
    }
});

const createMsgRegister = (first_name) => {
    return (
        `<h2>Hola ${first_name}, ahora podés usar nuestros servicios</h2>`
    )
};

const createMsgAccountDeletion = (first_name) => {
    return (
        `<p>Hola ${first_name}, tu cuenta ha sido eliminada debido a la inactividad.</p>`
    )
}

const createMsgResetPass = (first_name) => {
    return (
        `<p>${first_name}, hacé click <a href='http://localhost:8080/api/users/new-password'>ACÁ</a> para cambiar tu contraseña</p>`
    )
}

const createMsgProductDeletion = (first_name, productName) => {
    return (
        `<p>Hola ${first_name}, tu producto ${productName} ha sido eliminado.</p>`
    )
}

export const sendMail = async (user, service, token = null) => {
    try {
        const { first_name, email } = user;
        let message = '';
        let subj = '';

        switch (service) {
            case "register":
                message = createMsgRegister(first_name);
                subj = 'Registro existoso';
                break;
            case "resetPassword":
                message = createMsgResetPass(first_name);
                subj = 'Recupera tu contraseña';
                break;
            case "accountDeletion":
                message = createMsgAccountDeletion(first_name);
                subj = 'Eliminación de cuenta por inactividad';
                break;
            case "productDeletion":
                message = createMsgProductDeletion(first_name, productName);
                subj = 'Eliminación de producto';
                break;
            default:
                message = "";
                break;
        };

        const gmailOptions = {
            from: config.EMAIL,
            to: email,
            subject: subj,
            html: message
        };

        const response = await transporter.sendMail(gmailOptions)
        if (token !== null) {
            return token
        } else {
            logger.info(`Correo enviado a ${email}: ${response}`);
            return "Correo enviado";
        }
    } catch (error) {
        logger.error(`Error al enviar correo electrónico: ${error.message}`);
        throw new Error(error.message);
    };
};