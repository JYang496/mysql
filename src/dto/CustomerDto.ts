import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CustomerDto {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(150)
    age: number;

}
