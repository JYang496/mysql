import "reflect-metadata";
import {createConnection} from "typeorm";
import {Customer} from "./entity/Customer";
import {CustomerDto} from "./dto/CustomerDto";
import {validateUserDto} from "./dto/DtoValidation";
const mysql = require('mysql2')

createConnection().then(async connection => {

    console.log("Inserting a new user into the database...");
    const json = {
        id: 25,
        firstName: 'John',
        lastName: 'Doe',
        age: 30
    };
    const userDto = new CustomerDto()
    userDto.id = json.id
    userDto.firstName = json.firstName
    userDto.lastName = json.lastName
    userDto.age = json.age

    await validateUserDto(userDto)

    const user = new Customer();
    user.firstName = userDto.firstName;
    user.lastName = userDto.lastName;
    user.age = userDto.age;
    await connection.manager.save(user);
    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(Customer);
    console.log("Loaded users: ", users);

    console.log("Here you can setup and run express/koa/any other framework.");

}).catch(error => console.log(error));
