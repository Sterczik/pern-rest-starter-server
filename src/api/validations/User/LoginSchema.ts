import { ValidationSchema } from 'class-validator';

export let LoginValidationSchema: ValidationSchema = {
    name: "loginValidationSchema",
    properties : {
        email: [
            {
                type: "isEmail",
                constraints: [],
                message: 'Invalid email.'
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Email is required.'
            }
        ],
        password: [
            {
                type: "minLength",
                constraints: [6]
            },
            {
                type: "maxLength",
                constraints: [30]
            },
            {
                type: "isString",
                constraints: []
            },
            {
                type: "matches",
                constraints: [/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/]
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Password is required.'
            }
        ]
    }
}