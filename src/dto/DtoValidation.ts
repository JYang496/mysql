import { validate } from 'class-validator';
import {CustomerDto} from "./CustomerDto";
import {plainToClass} from "class-transformer";

export async function validateUserDto(userDto: CustomerDto): Promise<string[]> {
    // Validate the UserDto object
    const errors = await validate(userDto);

    if (errors.length > 0) {
        // If there are validation errors, collect and return them as an array of strings
        const errorMessages: string[] = [];
        errors.forEach((error) => {
            const constraints = error.constraints;
            if (constraints) {
                Object.values(constraints).forEach((constraint) => {
                    errorMessages.push(constraint);
                });
            }
        });
        console.log(`+++++++++++\n${errorMessages}`)
        return errorMessages;
    }

    // If there are no validation errors, return an empty array
    console.log(`============\nall green`)
    return [];
}

// Example usage
const user = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
};
