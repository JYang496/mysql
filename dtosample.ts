import { plainToClass } from 'class-transformer';
import {UserDTO} from './user';

const user = {
    id: 25,
    firstName: 'John',
    lastName: 'Doe',
    age: 30
};

const userDTO = plainToClass(UserDTO, user, { excludeExtraneousValues: true });
console.log(userDTO);