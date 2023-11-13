// import {
//     IsArray,
//     IsBase64,
//     IsBoolean,
//     IsEmail, IsEnum,
//     IsInt, IsISO8601, IsJSON, IsNumber,
//     IsNumberString, IsObject,
//     IsOptional,
//     IsString,
//     Length,
//     MaxLength
// } from 'class-validator';
// import {BasePaginationDto} from './BasePaginationDto';
// import {Currency, PaymentTypes} from "../../helper/consts";
// import {Column} from "typeorm";
// import {ContractPaymentLogs} from "../contract_payment_logs.entity";
//
// export class FetchAllTrackingDto extends BasePaginationDto {
//     @IsOptional()
//     @IsString()
//     user: string
//
//     @IsOptional()
//     @IsString()
//     category: string
// }
//
// export class FetchTrackingByDateDto {
//     @IsOptional()
//     @IsInt()
//     user: number
//
//     @IsOptional()
//     @IsString()
//     startDate: string
//
//     @IsOptional()
//     @IsString()
//     endDate: string
// }
// export class FetchSingleContractDto {
//
//     @IsString()
//     uid: string
//
//     @IsString()
//     cid: string
// }
//
// export class CreateContractTemplateDto {
//     @IsString()
//     name: string
//
//     @IsOptional()
//     @Length(1, 50)
//     cidPrefix: string
//
//     @IsString()
//     description: string
//
//     @IsOptional()
//     @IsString()
//     text: string
//
//     @IsOptional()
//     @IsString()
//     modifiedContractBody: string
//
//     @IsOptional()
//     @IsEnum(['head', 'body'])
//     type: string
//
//     @IsOptional()
//     @Length(1, 250)
//     partyBName: string
//
//     @IsOptional()
//     emailAccountId: number
//
//     @IsOptional()
//     cloneId: number
// }
//
//
// export class CreatePaymentReceiverDto {
//     @IsString()
//     name: string
//
//     @IsString()
//     bank: string
//
//     @IsString()
//     @IsEmail()
//     user: string
//
//     @IsString()
//     password: string
//
//     @IsString()
//     host: string
//
//     @IsString()
//     port: string
// }
//
//
// export class UpdatePaymentReceiverDto {
//     @IsArray()
//     @IsInt({ each: true })
//     ids: number[]
//     @IsBoolean()
//     isActive: boolean
// }
//
//
// export class FetchContractTemplateDto extends BasePaginationDto {
//     @IsOptional()
//     @IsEnum(['head', 'body', 'term']) // adding term category for contract term pagination
//     category: string
// }
//
// export class FetchContractDto extends BasePaginationDto {}
//
// export class SearchContractNoPageDto {
//     @IsString()
//     searchKey: string
// }
//
//
//
//
// export class UpdateContractTemplateDto extends CreateContractTemplateDto {
//     @IsNumberString()
//     id: number
// }
//
// export class UpdateContractTemplateStatus {
//     @IsOptional()
//     @IsBoolean()
//     isActive: boolean
//
//     @IsOptional()
//     @IsBoolean()
//     isDelete: boolean
//
//     @IsArray()
//     @IsInt({ each: true })
//     ids: number[]
// }
//
// export class CreateContractDto {
//     @IsInt()
//     customerId: number
//
//     @IsInt()
//     productId: number
//
//     @IsString()
//     @Length(2, 250)
//     name: string
//
//     @IsString()
//     taxRate: string
//
//     @IsString()
//     taxAmount: string
//
//     @IsString()
//     discount: string
//
//     @IsString()
//     total: string
//
//     @IsNumberString()
//     price: number
//
//     @IsBoolean()
//     tax: boolean
//
//     @IsOptional()
//     @IsString()
//     @MaxLength(250)
//     notes: string
//
//     @IsInt()
//     headId: number
//
//     @IsString()
//     text: string
//
//     @IsNumber()
//     currency: number
//
//     @IsEmail()
//     @Length(2, 255)
//     email: string
//
//     @IsOptional()
//     @IsInt()
//     mainId: number
//
//     @IsOptional()
//     @IsBoolean()
//     isMain: boolean
// }
//
// export class CreatePaymentHistoryFromLogDto{
// @IsString()
// cid:string
//
// @IsNumber()
// pid:number
//
// @IsString()
// amountPaying:string
// }
//
// export class UpdateContractRemainingDto{
//     @IsString()
//     cid:string
//
//     @IsNumber()
//     remaining:number
// }
//
//
// export class CreatePaymentHistoryDto {
//     @IsEmail()
//     email: string
//
//     @IsOptional()
//     @IsString()
//     payerName: string
//
//     @IsString()
//     receiveTime: string
//
//     @IsEnum(Object.values(PaymentTypes))
//     paymentType: string
//
//     @IsNumberString()
//     amount: string
//
//     @IsString()
//     cid: string
//
//     @IsNumberString()
//     conversionRate: string = '1'
//
//     @IsEnum(Object.values(Currency))
//     currency:string
//
//     @IsString()
//     noteInJson:string
//
//     @IsOptional()
//     paymentLog:ContractPaymentLogs
//
//
//     @IsOptional()
//     @IsString()
//     phoneNumber: string
//
//     @IsOptional()
//     @IsString()
//     referenceNumber: string
//
//
//
//
// }
//
//
//
// export class UpdateContractDto extends CreateContractDto {
//     @IsInt()
//     id: number
// }
//
// export class UpdateContractReadDateDto {
//     @IsString()
//     cid: string
//
//     @IsInt()
//     customerId: number
//
//     @IsEnum(['openDate', 'readDate'])
//     type: string
//
//     @IsString()
//     source: string
// }
//
// export class ContractChartDto{
//     @IsEnum(['day','week','month','year'])
//     timeIntervalType: string
//     @IsISO8601()
//     timeIntervalStart: Date
//     @IsISO8601()
//     timeIntervalEnd: Date
// }
//
// export class SignContractDto {
//     @IsString()
//     @Length(10, 30)
//     cid: string
//
//     @IsInt()
//     uid: string
//
//     @IsBase64()
//     signature: string
// }
//
// export class ContractCidDto {
//     @IsString()
//     @Length(10, 30)
//     cid: string
// }
//
// export class ContractAndUserIdDto extends ContractCidDto {
//     @IsInt()
//     uid: number
// }
//
// export class ContractEmailDto extends ContractAndUserIdDto {
//     @IsString()
//     serverUrl: string
// }
//
// export class UploadContractFileDto extends ContractCidDto {
//     @IsNumberString()
//     uid: number
//
//     @IsString()
//     name: string
//
//     @IsString()
//     description: string
// }
//
// export class GetContractFileDto extends ContractCidDto {
//     @IsString()
//     fileUid: string
//
//     @IsInt()
//     uid: number
// }
//
// export class CreateContractNoteDto {
//     @IsString()
//     @Length(10, 30)
//     cid: string
//
//     @IsString()
//     notes: string
// }
//
// export class EditContractNoteDto extends CreateContractNoteDto {
//     @IsInt()
//     id: number
// }
//
// export class CreateOrUpdateContractCommissionDto {
//     @IsString()
//     @Length(10, 30)
//     cid: string
//
//     @IsNumberString()
//     price: number
//
//     @IsString()
//     notes: string
//
//     @IsEnum(['cancelled', 'unpaid', 'partial', 'paid'])
//     status: string
// }
//
// export class FetchInvoiceDto extends BasePaginationDto {
//     @IsOptional()
//     @IsEnum(['all', 'asked', 'issuing'])
//     category: string
// }
// export class CreateInvoiceDto {
//     @IsString()
//     @Length(10, 30)
//     iid: string
//
//     @IsEnum(['asked', 'issuing'])
//     type: string
//
//     @IsInt()
//     customerId: number
//
//     @IsBoolean()
//     isCompany: boolean
//
//     @IsNumberString()
//     @Length(8, 8)
//     dateCode: string
//
//     @IsISO8601()
//     dueDate: Date
//
//     @IsInt()
//     headId: number
//
//     @IsOptional()
//     @IsString()
//     @MaxLength(250)
//     notes: string
//
//     @IsString()
//     instructions: string
//
//     @IsEmail()
//     @Length(2, 255)
//     email: string
//
//     @IsBoolean()
//     tax: boolean
//
//     @IsJSON()
//     items: string
// }
//
// export class CreateInvoiceNoteDto {
//     @IsString()
//     @Length(10, 30)
//     iid: string
//
//     @IsString()
//     notes: string
// }
//
// export class EditInvoiceNoteDto extends CreateInvoiceNoteDto {
//     @IsInt()
//     id: number
// }
//
// export class SignInvoiceDto {
//     @IsString()
//     @Length(10, 30)
//     iid: string
//
//     @IsInt()
//     uid: string
//
//     @IsBase64()
//     signature: string
// }
//
// export class GetInvoiceDto {
//     @IsString()
//     @Length(10, 30)
//     iid: string
//
//     @IsInt()
//     uid: string
//
//     @IsOptional()
//     @IsBoolean()
//     paid: boolean
// }
//
// export class InvoiceEmailDto extends GetInvoiceDto {
//     @IsString()
//     serverUrl: string
// }
//
// export class CreateCustomerNoteDto {
//     @IsNumberString()
//     customerId: number
//
//     @IsString()
//     notes: string
// }
//
// export class EditCustomerNoteDto extends CreateCustomerNoteDto {
//     @IsInt()
//     noteId: number
// }
//
// export class GetCustomerNoteFileDto {
//     @IsInt()
//     customerId: number
//
//     @IsInt()
//     noteId: number
// }
//
// export class CreateCustomerPaymentDto {
//     @IsInt()
//     customerId: number
//
//     @IsString()
//     payment: string
// }
//
// export class EditCustomerPaymentDto extends CreateCustomerPaymentDto {
//     @IsInt()
//     paymentId: number
// }
//
// export class assignPaymentEmailToOneContractDto {
//     @IsString()
//     email: string
//
//     @IsString()
//     fname: string
//
//     @IsString()
//     lname: string
//
//     @IsString()
//     cid: string
// }
//
// // contract term dto
// export class CreateContractTermDto {
//
//
//     @IsString()
//     @Length(2, 255)
//     title: string
//
//     @IsString()
//     @Length(2, 255)
//     slug: string
//
//     @IsString()
//     text: string
//
//     @IsOptional()
//     @IsString()
//     description:string
//
//     @IsEnum(['true', 'false'])
//     isDefault: string
//
// }
//
//
// export class UpdateContractTermDto extends CreateContractTermDto{
//     @IsNumberString()
//     id: number
// }
