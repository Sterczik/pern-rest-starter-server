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
                type: "isString",
                constraints: []
            },
            {
                type: "isNotEmpty",
                constraints: [],
                message: 'Password is required.'
            }
        ]
    }
}