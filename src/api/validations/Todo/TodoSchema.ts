import { ValidationSchema } from 'class-validator';

export let TodoValidationSchema: ValidationSchema = {
    name: "todoValidationSchema",
    properties : {
        name: [
            {
                type: "isDefined",
                constraints: []
            },
            {
                type: "minLength",
                constraints: [3]
            },
            {
                type: "maxLength",
                constraints: [80]
            }
        ]
    }
}