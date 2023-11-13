// import {NextFunction, Request, Response} from 'express'
// import gDB from '../../InitDataSource'
// import {ContractTemplate} from '../entity/contract_template.entity'
// import {
//     ContractAndUserIdDto,
//     ContractChartDto,
//     ContractCidDto,
//     ContractEmailDto,
//     CreateContractDto,
//     CreateContractNoteDto,
//     CreateContractTemplateDto,
//     CreateOrUpdateContractCommissionDto,
//     CreatePaymentHistoryDto,
//     EditContractNoteDto,
//     FetchContractDto,
//     FetchContractTemplateDto,
//     GetContractFileDto,
//     SignContractDto,
//     UpdateContractDto,
//     UpdateContractReadDateDto,
//     UpdateContractTemplateDto,
//     UpdateContractTemplateStatus,
//     UploadContractFileDto,
//     CreatePaymentReceiverDto,
//     UpdatePaymentReceiverDto,
//     FetchSingleContractDto, UpdateContractTermDto, CreateContractTermDto
// } from './AdministrativeDto'
// import {Contract} from '../entity/contract.entity'
// import {User} from '../entity/user.entity'
// import {sendContractMailToSign} from '../helper/MailHelper'
// import {createContractPdfFileFromHtml, noSignatureB64} from '../helper/PDFHelperContract'
// import {UploadedFile} from 'express-fileupload'
// import {checkFileIsOverSize, copyFile, FileType, getAbsoluteFilePath, renameFile, saveFile} from '../helper/UploadFile'
// import {ContractFile} from '../entity/contract_file.entity'
// import * as fs from 'fs'
// import {ErrStr, ResError, sendResError} from '../helper/ResponseError'
// import {Notes} from '../entity/notes.entity'
// import {BaseController} from './BaseController'
// import {fetchPaginatedData, PaginationParams} from '../helper/Pagination'
// import {dotConcat, dotConcatList} from '../helper/StringHelper'
// import {UpdateStatusDto} from '../entity/dto/BaseDto'
// import {ChartQueryContract, getMomentIndex, newChartReturnArray} from '../helper/ContractChart'
// import {Product} from '../entity/product.entity'
// import {getTrackingDetails} from '../helper/ReqContext'
// import {Tracker} from '../entity/tracker.entity'
// import {ContractCommission} from '../entity/contract_commission.entity'
// import {In, Like, Not} from 'typeorm'
// import {canNum, canStr, CLog} from '../../AppHelper'
// import {ContractPaymentEmails} from '../entity/contract_payment_emails.entity'
// import {validate} from 'class-validator'
// import {ContractPaymentHistory} from '../entity/contract_payment_history.entity'
// import {ContractPaymentLogs} from '../entity/contract_payment_logs.entity'
// import {ContractPaymentHistoryPictures} from '../entity/contract_payment_history_pictures.entity'
// import {ContractPaymentHistoryNotes} from '../entity/contract_payment_history_notes.entity'
// import {
//     ContractTermPagination as pG,
//     Currency,
//     MailWorkerRedisKeys,
//     PaymentProcessStatus,
//     PaymentTypes
// } from '../helper/consts'
// import {ContractCurrency} from '../entity/contract_currency.entity'
// import {ContractPaymentReceiver} from '../entity/contract_payment_receiver.entity'
// import {convertToCents} from '../helper/PaymentHelper'
// import {BasePaginationDto} from '../entity/dto/BasePaginationDto'
// import moment = require('moment')
// import {ContractTerm} from '../entity/contract_term.entity'
// import {Course} from '../entity/olts/course.entity'
// import {ReviewProduct} from '../entity/review_product.entity'
//
// const jsdom = require('jsdom')
// const {JSDOM} = jsdom
//
// const FIELD_OPTIONS = ['address', 'contractID', 'country', 'discount', 'email', 'firstName', 'name', 'phone', 'price', 'taxAmount', 'total', 'wechat']
//
// class ContractController extends BaseController {
//     static async fetchAllContractTemplates(req: Request, res: Response) {
//         const list = await gDB.getRepository(ContractTemplate).findBy({isDelete: false})
//         return res.send({rs: true, data: list})
//     }
//
//     static async fetchAllContractTemplatesByPage(req: Request, res: Response) {
//         const {
//             page,
//             perPage,
//             category,
//             sortColumn,
//             sortOrder,
//             searchKey,
//             previous,
//             next
//         }: FetchContractTemplateDto = req.body.dto
//
//         const filters = {'isDelete': false, 'type': category}
//         try {
//             let {queryBuilder, alias} = super.queryBuilderAndLeftJoin(ContractTemplate)
//             const props: PaginationParams = {
//                 queryBuilder,
//                 entity: ContractTemplate,
//                 page,
//                 perPage,
//                 sortCol: sortColumn,
//                 sortOrder,
//                 searchCols: ['id', 'name', 'description'].map(attr => dotConcat(alias, attr)),
//                 searchKey,
//                 filters,
//                 previous,
//                 next,
//                 defaultSortCol: 'id',
//                 defaultSearchCol: 'content'
//             }
//             const result = await fetchPaginatedData(props)
//
//             return res.send(result)
//         } catch (e) {
//             CLog.bad('fetchAllContractTemplatesByPage Error:', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchAllContractTemplateHeads(req: Request, res: Response) {
//         const list = await gDB.getRepository(ContractTemplate).findBy({isDelete: false, type: 'head'})
//         return res.send({rs: true, data: list})
//     }
//
//     static async __deleteFile(oldFileName, fileType) {
//         const newFileName = `deleted_${oldFileName}`
//         await renameFile(oldFileName, newFileName, fileType)
//     }
//
//     static async fetchContractTemplate(req: Request, res: Response) {
//         const id = +req.params.id
//         if (!canNum(id)) {
//             return {rs: false, message: `invalid ContractTemplate id`}
//         }
//
//         const contract = await gDB.getRepository(ContractTemplate).findOne({
//             where: {id, isDelete: false}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//
//         if (contract.type === 'head') {
//             // Get signature
//             let b64Img = noSignatureB64
//             try {
//                 const fullPath = await getAbsoluteFilePath(contract.partyBSignature, FileType.ContractSignatureImage)
//                 if (!fs.existsSync(fullPath)) {
//                     CLog.bad('Error: Signature not found')
//                     return res.send({rs: false, message: ErrStr.FoundDataError})
//                 } else {
//                     const bitmap = fs.readFileSync(fullPath)
//                     b64Img = 'data:image/png;base64,' + bitmap.toString('base64')
//                 }
//             } catch (e) {
//                 CLog.bad('Error in Signature', e.message)
//                 return res.send({rs: false, message: ErrStr.FoundDataError})
//             }
//             contract['partyBSignatureImage'] = b64Img
//         }
//
//         return res.send({rs: true, data: contract})
//     }
//
//     static async __uploadContractTemplateFile(fileToUpload, contract, isEdit, fileType, isClone = false) {
//         // Updating a param with files
//         const uploadFile = fileToUpload as UploadedFile
//         const [isFileCheckNotPass, message] = await checkFileIsOverSize(uploadFile, 'max_file_size')
//         if (isFileCheckNotPass) {
//             return {rs: false, message: `File must be less than ${message}`}
//         }
//
//         if (isClone) {
//             // Copy old file
//             try {
//                 const fileExt = fileToUpload.name.split('.').pop()
//                 const newName = Math.random().toString(16).substring(2, 10) + new Date().getMilliseconds() + '.' + fileExt
//                 const result = await copyFile(fileToUpload.path, newName, fileType)
//                 return {rs: result, message: newName}
//             } catch (e) {
//                 CLog.bad(`Error in __updateContractTemplateFile, `, e)
//                 return {rs: false, message: ErrStr.UpdateDataError}
//             }
//         } else {
//             // Create new file
//             if (uploadFile && !Array.isArray(uploadFile)) {
//                 let savedFileUrl = ''
//                 try {
//                     // Save new file
//                     savedFileUrl = await saveFile(uploadFile, fileType)
//                     if (isEdit) {
//                         // Rename old file as deleted
//                         const oldFileName = fileType === FileType.ContractHeaderImage ? contract.filename : contract.partyBSignature
//                         await ContractController.__deleteFile(oldFileName, fileType)
//                     }
//                 } catch (e) {
//                     CLog.bad('Error when __uploadContractTemplateFile', e.message)
//                     return {rs: false, message: ErrStr.UpdateDataError}
//                 }
//                 return {rs: true, message: savedFileUrl}
//             }
//         }
//
//         return {rs: false, message: ErrStr.CreateDataError}
//     }
//
//     static async createContractTemplate(req: Request, res: Response) {
//         const createContractDto: CreateContractTemplateDto = req.body.dto
//         let isPass = true
//         let message = 'OK'
//
//         if (createContractDto.type === 'head' &&
//             (!createContractDto.cloneId && (!req.files?.header || !req.files?.signature))) {
//             // Head template requires both header image and signature image
//             return res.send({rs: false, message: 'Head Template requires both header and signature images'})
//         }
//
//         try {
//             // test if template name already exists
//             const checkTemplate = await gDB.getRepository(ContractTemplate).findOne({
//                 where: {name: createContractDto.name}
//             })
//             if (checkTemplate) {
//                 return res.send({rs: false, message: 'Template name already exists'})
//             }
//
//             const contract: ContractTemplate = new ContractTemplate()
//             for (let key of Object.keys(createContractDto)) {
//                 contract[key] = createContractDto[key]
//             }
//
//
//             if (!createContractDto.emailAccountId) {
//                 // reset to null
//                 contract.emailAccountId = null
//             }
//
//             const tempContract = await contract.save()
//
//
//             // Upload file if it's a header template, both are required
//             if (tempContract.type === 'head') {
//
//                 let oldTemplate, headerFile, signatureFile
//                 let cloneHeader, cloneSignature = false
//                 if (createContractDto.cloneId) {
//                     // get old files
//                     oldTemplate = await gDB.getRepository(ContractTemplate).findOne({
//                         where: {id: +createContractDto.cloneId}
//                     })
//                 }
//
//                 // Header image
//                 if (req.files?.header) {
//                     // Upload Header Image
//                     headerFile = req.files.header
//                 } else {
//                     // Clone header image
//                     const headerPath = await getAbsoluteFilePath(oldTemplate.filename, FileType.ContractHeaderImage)
//                     headerFile = {path: headerPath, name: oldTemplate.filename}
//                     cloneHeader = true
//                 }
//
//                 const uploadHeaderFile = await ContractController.__uploadContractTemplateFile(headerFile, tempContract, false, FileType.ContractHeaderImage, cloneHeader)
//                 if (uploadHeaderFile.rs) {
//                     tempContract['filename'] = uploadHeaderFile.message
//                 } else {
//                     isPass = false
//                     message = uploadHeaderFile.message
//                 }
//
//                 // Signature image
//                 if (req.files?.signature) {
//                     // Upload Signature Image
//                     signatureFile = req.files.signature
//                 } else {
//                     // Clone signature image
//                     const signaturePath = await getAbsoluteFilePath(oldTemplate.partyBSignature, FileType.ContractSignatureImage)
//                     signatureFile = {path: signaturePath, name: oldTemplate.partyBSignature}
//                     cloneSignature = true
//                 }
//
//                 const uploadSigFile = await ContractController.__uploadContractTemplateFile(signatureFile, tempContract, false, FileType.ContractSignatureImage, cloneSignature)
//                 if (uploadSigFile.rs) {
//                     tempContract['partyBSignature'] = uploadSigFile.message
//                 } else {
//                     isPass = false
//                     message = uploadSigFile.message
//                 }
//             }
//
//             if (!isPass) {
//                 await tempContract.remove()
//             } else {
//                 await tempContract.save()
//             }
//
//             return res.send({rs: isPass, message})
//         } catch (e) {
//             // Duplicate name
//             if (e.errno === 1062) {
//                 CLog.bad('Error Contract template name already exists', e.message)
//                 return res.send({rs: false, message: 'Contract template name already exists'})
//             }
//             return res.send({rs: false, message: e.message})
//         }
//     }
//
//     static async updateContractTemplate(req: Request, res: Response) {
//         const updateContractDto: UpdateContractTemplateDto = req.body.dto
//         let isPass = true
//         let message = 'OK'
//
//         try {
//             const contract = await gDB.getRepository(ContractTemplate).findOneBy({id: +updateContractDto.id})
//             if (!contract) {
//                 return res.send({rs: false, message: 'Contract template not found'})
//             }
//
//             for (let key of Object.keys(updateContractDto)) {
//                 // ID & Type cannot be updated
//                 if (!['id', 'type'].includes(key)) {
//                     contract[key] = updateContractDto[key]
//                 }
//             }
//
//             if (!updateContractDto.emailAccountId) {
//                 // reset to null
//                 contract.emailAccountId = null
//             }
//
//             // Upload file if it's a header template
//             if (contract.type === 'head' && req?.files) {
//                 // Upload Signature Image
//                 if (req.files?.header) {
//                     const uploadFile = await ContractController.__uploadContractTemplateFile(req.files.header, contract, true, FileType.ContractHeaderImage)
//                     if (uploadFile.rs) {
//                         contract['filename'] = uploadFile.message
//                     } else {
//                         isPass = false
//                         message = uploadFile.message
//                     }
//                 }
//                 // Upload Signature Image
//                 if (req.files?.signature) {
//                     const uploadFile = await ContractController.__uploadContractTemplateFile(req.files.signature, contract, true, FileType.ContractSignatureImage)
//                     if (uploadFile.rs) {
//                         contract['partyBSignature'] = uploadFile.message
//                     } else {
//                         isPass = false
//                         message = uploadFile.message
//                     }
//                 }
//             }
//
//
//             // Only save if this was a successful edit
//             if (isPass) {
//                 await contract.save()
//             }
//
//             return res.send({rs: isPass, message: message})
//         } catch (e) {
//             CLog.bad('Error when updateContractTemplate', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//     static async updateContractTemplateStatus(req: Request, res: Response) {
//         const {ids, isActive, isDelete}: UpdateContractTemplateStatus = req.body.dto
//         try {
//             const contracts = await gDB.getRepository(ContractTemplate).findBy({
//                 id: In(ids)
//             })
//             if (contracts.length > 0) {
//                 for (const contract of contracts) {
//                     if (isActive !== undefined) {
//                         contract.isActive = isActive
//                     }
//                     if (isDelete !== undefined && isDelete) {
//                         contract.isDelete = true
//                         if (contract.filename) {
//                             await ContractController.__deleteFile(contract.filename, FileType.ContractHeaderImage)
//                         }
//                         if (contract.partyBSignature) {
//                             await ContractController.__deleteFile(contract.partyBSignature, FileType.ContractSignatureImage)
//                         }
//                         // Rename so name can be reused
//                         contract.name = `${contract.name}_${new Date().getTime()}`
//                     }
//                     await contract.save()
//                 }
//             }
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error when updateContractTemplateStatus', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//     static async fetchAllContracts(req: Request, res: Response) {
//         try {
//             const list = await gDB.getRepository(Contract)
//                 .createQueryBuilder('contract')
//                 .leftJoinAndSelect('contract.customer', 'customer')
//                 .leftJoinAndSelect('contract.sales', 'sales')
//                 .leftJoinAndSelect('contract.product', 'product')
//                 .leftJoinAndSelect('contract.paymentEmails', 'paymentEmails')
//                 .where('contract.isDelete=false')
//                 .andWhere('contract.isMain=true')
//                 .select(['contract', 'product', 'customer.id',
//                     'customer.firstName', 'customer.lastName', 'customer.email',
//                     'customer.phone', 'customer.wechat', 'sales.firstName', 'sales.lastName', 'paymentEmails'
//                 ])
//                 .getRawMany()
//             if (!list) {
//                 return res.send({rs: false, message: 'No contracts'})
//             }
//
//             const result = list.map(v => ({
//                 ...v,
//                 id: v.contract_id,
//                 customer_fullName: `${v.customer_firstName} ${v.customer_lastName}`,
//                 sales_fullName: `${v.sales_firstName} ${v.sales_lastName}`
//             }))
//
//             return res.send({rs: true, data: result})
//         } catch (e) {
//             CLog.bad('Error when fetching all contracts', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchAllContractsByPage(req: Request, res: Response) {
//         const {page, perPage, sortColumn, sortOrder, searchKey, previous, next}: FetchContractDto = req.body.dto
//         try {
//             let {queryBuilder, alias} = super.queryBuilderAndLeftJoin(Contract,
//                 ['customer', 'sales', 'product', 'readTracking', 'commissions', 'paymentEmails', 'contractPaymentHistory', 'currency'])
//
//             const selectedCols = ['contract', 'product', 'customer.id', 'readTracking', 'commissions',
//                 'customer.firstName', 'customer.nickName', 'customer.lastName', 'customer.email',
//                 'customer.phone', 'customer.wechat', 'sales.firstName', 'sales.lastName', 'paymentEmails', 'currency',
//                 'contractPaymentHistory']
//             queryBuilder = queryBuilder
//                 .select(selectedCols)
//                 .leftJoinAndSelect('contractPaymentHistory.contractPaymentHistoryPictures', 'contractPaymentHistoryPictures')
//                 .leftJoinAndSelect('contractPaymentHistory.contractPaymentHistoryNotes', 'contractPaymentHistoryNotes')
//                 .loadRelationCountAndMap('contract.notes', 'contract.notes',
//                     'noteCount', qb => qb.andWhere('noteCount.isDelete=false'))
//             const filters = {
//                 [dotConcat(alias, 'isDelete')]:
//                     false, [dotConcat(alias, 'isMain')]: true
//             }
//             const props: PaginationParams = {
//                 queryBuilder,
//                 entity: Contract,
//                 page,
//                 perPage,
//                 sortCol: dotConcat(alias, sortColumn),
//                 sortOrder,
//                 searchCols:
//                     [dotConcat('sales', 'firstName'), dotConcat('sales', 'lastName'),
//                         dotConcat('customer', 'firstName'), dotConcat('customer', 'lastName'),
//                         dotConcat(alias, 'id'), dotConcat(alias, 'cid'), dotConcat(alias, 'name')],
//                 searchKey,
//                 filters,
//                 previous,
//                 next,
//                 defaultSortCol: dotConcat(alias, 'id'),
//                 defaultSearchCol: dotConcat(alias, 'name')
//             }
//             const result = await fetchPaginatedData(props)
//             result.data = result.data?.map(v => ({
//                 ...v,
//                 customer_fullName: `${v.customer.firstName} ${v.customer.lastName}`,
//                 sales_fullName: `${v.sales.firstName} ${v.sales.lastName}`
//             }))
//
//
//             //formalize the data in front end, rui, amount / 100
//             // result.data = result.data.map((contract) => {
//             //     let temp = {...contract}
//             //     temp.remaining = temp.remaining
//             //     temp.taxRate = JSON.stringify(temp.taxRate/100)
//             //     temp.taxAmount = temp.taxAmount
//             //     temp.discount = temp.discount
//             //     temp.total = temp.total
//             //     temp.contractPaymentHistory = temp.contractPaymentHistory.map((paymentHistory) => {
//             //         let tempPaymentHistory = {...paymentHistory}
//             //         tempPaymentHistory.amount = tempPaymentHistory.amount
//             //         tempPaymentHistory.amountInCAD = tempPaymentHistory.amountInCAD
//             //         return tempPaymentHistory
//             //     })
//             //     return temp
//             // })
//
//             return res.send({rs: true, data: result})
//         } catch (e) {
//             CLog.bad('Error in fetchAllContractsByPage', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchLatestContract(req: Request, res: Response) {
//         const {uid} = req.params
//
//         try {
//             const contract = await gDB.getRepository(Contract)
//                 .createQueryBuilder('contract')
//                 .leftJoinAndSelect('contract.customer', 'customer')
//                 .where('contract.isDelete=false')
//                 .andWhere('contract.isActive=true')
//                 .andWhere('customer.uid=:uid', {uid})
//                 .orderBy('contract.createdAt', 'DESC')
//                 .getOne()
//
//             return res.send({rs: true, data: contract})
//         } catch (e) {
//             CLog.bad('Error in fetchLatestContract', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchContract(req: Request, res: Response) {
//         let contract: Contract = undefined
//         let b64Img = noSignatureB64
//
//         try {
//             // const dto : FetchSingleContractDto= req.params
//             // const {cid,uid} = {...req.params.dto}
//             const {cid, uid}: FetchSingleContractDto = req.body.paramsDto
//
//             contract = await gDB.getRepository(Contract).findOne({
//                 relations: ['customer', 'sales', 'mainContract', 'subContract', 'files', 'head', 'product'],
//                 where: {cid: cid, isDelete: false, customer: {id: +uid}}
//             })
//             if (!contract) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//             if (contract.files) {
//                 contract.files = contract.files.filter(file => !file.isDelete)
//             }
//
//             // Get signature
//             const fullPath = await getAbsoluteFilePath(contract.head.partyBSignature, FileType.ContractSignatureImage)
//             if (!fs.existsSync(fullPath)) {
//                 CLog.bad('Error: Signature not found')
//             } else {
//                 const bitmap = fs.readFileSync(fullPath)
//                 b64Img = 'data:image/png;base64,' + bitmap.toString('base64')
//             }
//             contract.head['partyBSignatureImage'] = b64Img
//
//             return res.send({rs: true, data: contract})
//         } catch (e) {
//             CLog.bad('Signature Error:', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchContractPublic(req: Request, res: Response) {
//         const {uid, cid} = req.params
//         const validatedData = req.body.validatedData
//
//         const contract = await gDB.getRepository(Contract).findOne({
//             relations: ['customer', 'sales', 'head'],
//             where: {cid: cid, isDelete: false, isActive: true, customer: {id: +uid}}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//
//         let hasPerm = false
//         // Not registered users can only view contract when status is 'sent'
//         if (contract.status === 'sent') {
//             hasPerm = true
//         } else if (validatedData && validatedData?.user?.id) {
//             const foundUser = await gDB.getRepository(User).findOneBy({id: +validatedData.user.id})
//             hasPerm = foundUser.isStaff
//         }
//
//         if (hasPerm) {
//             const {firstName, lastName} = contract.customer
//             contract['customerName'] = `${firstName} ${lastName}`
//             delete contract.sales
//             return res.send({rs: true, data: contract})
//         } else {
//             CLog.bad('Contract not found', `${contract.customer}`)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async createContract(req: Request, res: Response) {
//         const contractDto: CreateContractDto = req.body.dto
//         console.log("this is req.body.dto",req.body.dto)
//         const {id} = req.body.validatedData.user
//
//         console.log("this is id",id)
//
//
//         try {
//             // Find Customer
//             const customer = await gDB.getRepository(User).findOneBy({id: +contractDto.customerId})
//             if (!customer) {
//                 CLog.bad('Customer does not exist', id)
//                 return res.send({rs: false, message: 'Customer does not exist'})
//             }
//             // find product
//             const product = await gDB.getRepository(Product).findOneBy({id: +contractDto.productId})
//             if (!product) {
//                 CLog.bad('Product does not exist')
//                 return res.send({rs: false, message: 'Product does not exist'})
//             }
//             let mainContract = null
//
//             if (contractDto.isMain !== undefined && contractDto.mainId !== undefined) {
//                 // This is a sub contract
//                 mainContract = await gDB.getRepository(Contract).findOne({
//                     relations: ['customer', 'head'],
//                     where: {id: +contractDto.mainId, isMain: true, customer: {id: +customer.id}}
//                 })
//                 if (!mainContract) {
//                     CLog.bad('Main contract does not exist')
//                     return res.send({rs: false, message: 'Main contract does not exist'})
//                 }
//             }
//
//
//             //todo jw1
//
//             const head = await gDB.getRepository(ContractTemplate).findOneBy({id: +contractDto.headId})
//
//             if (!head) {
//                 CLog.bad('Contract head does not exist')
//                 return res.send({rs: false, message: 'Contract head does not exist'})
//             }
//             const contractEntity = new Contract()
//
//             for (const param of Object.keys(contractDto)) {
//                 if (['taxRate', 'taxAmount', 'discount', 'total'].includes(param)) {
//                     contractEntity[param] = convertToCents(contractDto[param])
//                 }else if (['fields'].includes(param)) {
//                     const fields = [];
//                     for(const key of Object.keys(contractDto[param])){
//                         if(FIELD_OPTIONS.includes(key) && contractDto[param][key])
//                             fields.push(key)
//                     }
//                     contractEntity[param] = fields;
//                 }
//                 else if (!['notes'].includes(param)) {
//                     contractEntity[param] = contractDto[param]
//                 }
//             }
//             contractEntity.priceInCent = convertToCents(contractEntity.price)
//             contractEntity.remaining = contractEntity.total
//
//             if (contractEntity.discount > contractEntity.priceInCent || contractEntity.discount < 0) {
//                 return res.send({rs: false, message: 'Discount has to be a positive number less than contract price'})
//             }
//
//             if (contractEntity.priceInCent < 0) {
//                 return res.send({rs: false, message: ' Contract price, must equal or bigger than zero'})
//             }
//             if ((-contractEntity.discount + contractEntity.priceInCent) + contractEntity.taxAmount !== contractEntity.total) {
//                 return res.send({
//                     rs: false,
//                     message: 'Total price is not equal to the sum of taxAmount, price and discount, please double check'
//                 })
//             }
//
//             contractEntity.sales = customer
//             contractEntity.customer = customer
//             contractEntity.status = 'created'
//             contractEntity.head = head
//             contractEntity.product = product
//
//             //contractEntity.taxRate = 114
//             //contractEntity.taxAmount = 200
//             contractEntity.total = 9000
//             contractEntity.remaining = 8000
//             contractEntity.name = "test"
//             //contractEntity.cid = "test"
//
//
//
//             console.log("testtest")
//             console.log("this is contract entity",contractEntity)
//
//             // If this is a subcontract
//             if (mainContract) {
//                 contractEntity.mainContract = mainContract
//             }
//             const savedContract = await contractEntity.save()
//
//             console.log("test6")
//
//
//             // if this contract contains a note
//             if (contractDto.notes !== undefined && contractDto.notes.length > 0) {
//                 // Create and save note
//                 await gDB.getRepository(Notes).create({
//                     user: id,
//                     contract: savedContract,
//                     notes: contractDto.notes
//                 }).save()
//
//             }
//
//             return res.send({rs: true, message: 'OK', data: savedContract})
//             console.log("test7")
//
//
//         } catch (e) {
//             CLog.bad('Error in createContract', e.message)
//             console.log("note3")
//             return res.send({rs: false, message: ErrStr.CreateDataError})
//         }
//     }
//
//     static async updateContract(req: Request, res: Response) {
//         const contractDto: UpdateContractDto = req.body.dto
//         const {id} = req.body.validatedData.user
//
//         try {
//             // Make sure this contract belongs to the original customer
//             const contractEntity = await gDB.getRepository(Contract).findOne({
//                 relations: ['customer', 'head', 'product'],
//                 where: {id: +contractDto.id, customer: {id: +contractDto.customerId}}
//             })
//             if (!contractEntity) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//             if (['signed', 'done'].includes(contractEntity.status)) {
//                 return res.send({rs: false, message: `Contract is ${contractEntity.status}, can no longer be changed.`})
//             }
//
//             // find product
//             const product = await gDB.getRepository(Product).findOneBy({id: +contractDto.productId})
//             if (!product) {
//                 CLog.bad('Error in Product does not exist')
//                 return res.send({rs: false, message: 'Product does not exist'})
//             }
//
//             const head = await gDB.getRepository(ContractTemplate).findOneBy({id: +contractDto.headId})
//             if (!head) {
//                 CLog.bad('Error in Contract head does not exist')
//                 return res.send({rs: false, message: 'Contract head does not exist'})
//             }
//
//
//             for (const param of Object.keys(contractDto)) {
//                 if (['taxRate', 'taxAmount', 'discount', 'total'].includes(param)) {
//                     contractEntity[param] = convertToCents(contractDto[param])
//                 } else if (['fields'].includes(param)) {
//                     const fields = [];
//                     for(const key of Object.keys(contractDto[param])){
//                         if(FIELD_OPTIONS.includes(key) && contractDto[param][key])
//                             fields.push(key)
//                     }
//                     contractEntity[param] = fields;
//                 } else if (!['isMain', 'mainId', 'notes'].includes(param)) {
//                     contractEntity[param] = contractDto[param]
//                 }
//             }
//             contractEntity.priceInCent = convertToCents(contractEntity.price)
//             contractEntity.remaining = contractEntity.total
//
//             if (contractEntity.discount > contractEntity.priceInCent || contractEntity.discount < 0) {
//                 return res.send({rs: false, message: 'Discount has to be a positive number less than contract price'})
//             }
//             if (parseFloat(contractEntity.price) < 0) {
//                 return res.send({rs: false, message: ' Contract price, must equal or bigger than zero'})
//             }
//
//             if ((-contractEntity.discount + contractEntity.priceInCent) + contractEntity.taxAmount !== contractEntity.total) {
//                 return res.send({
//                     rs: false,
//                     message: 'Total price is not equal to the sum of taxAmount, price and discount, please double check'
//                 })
//             }
//
//             contractEntity.head = head
//             contractEntity.product = product
//             const savedContract = await contractEntity.save()
//
//             // if this contract contains a note
//             if (contractDto.notes !== undefined) {
//                 // Create and save note
//                 await gDB.getRepository(Notes).create({
//                     user: id,
//                     contract: savedContract,
//                     notes: contractDto.notes
//                 }).save()
//             }
//
//             return res.send({rs: true, message: 'OK', data: savedContract})
//         } catch (e) {
//             CLog.bad('Error in updateContract', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//     static async updateContractReadDate(req: Request, res: Response) {
//         const contractDto: UpdateContractReadDateDto = req.body.dto
//         try {
//             // Make sure this contract belongs to the original customer
//             const contractEntity = await gDB.getRepository(Contract).findOne({
//                 relations: ['customer', 'customer.sales'],
//                 where: {cid: contractDto.cid, customer: {id: +contractDto.customerId}}
//             })
//             if (!contractEntity) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             contractEntity[contractDto.type] = new Date()
//
//             if (contractDto.type === 'readDate' && !contractEntity.readTracking) {
//                 // when no tracking is set, create a new one
//                 const trackingData = {
//                     ...(await getTrackingDetails(req)),
//                     source: contractDto.source || '',
//                     contractRead: contractEntity,
//                     user: contractEntity.customer?.sales
//                 }
//                 contractEntity.readTracking = await gDB.getRepository(Tracker).create(trackingData).save()
//             }
//
//             const savedContract = await contractEntity.save()
//
//             return res.send({rs: true, message: 'OK', data: savedContract})
//         } catch (e) {
//             CLog.bad('Error in updateContractReadDate', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//
//     }
//
//     static async updateContractStatus(req: Request, res: Response) {
//         const {ids, isActive}: UpdateStatusDto = req.body.dto
//         try {
//             const contracts = await gDB.getRepository(Contract).findBy({
//                 id: In(ids)
//             })
//             if (contracts.length > 0) {
//                 contracts.forEach(contract => {
//                     contract.isActive = isActive
//                     contract.save()
//                 })
//             }
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error in updateContractStatus', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//     static async sendContractEmail(req: Request, res: Response) {
//         const {uid, cid, serverUrl}: ContractEmailDto = req.body.dto
//
//         // find contract
//         const contractEntity = await gDB.getRepository(Contract).findOne({
//             relations: ['customer', 'head'],
//             where: [
//                 {cid: cid, status: 'created', customer: {id: +uid}},
//                 {cid: cid, status: 'sent', customer: {id: +uid}}
//             ]
//         })
//         if (!contractEntity) {
//             CLog.bad('Error in sendContractEmail')
//             return res.send({rs: false, message: 'Contract does not exist'})
//         }
//
//         if (!contractEntity.isActive) {
//             CLog.bad('Error in sendContractEmail')
//             return res.send({rs: false, message: 'Cannot send a disabled contract'})
//         }
//
//         try {
//             // Send Email to Customer
//             const mailResult = await sendContractMailToSign(req, contractEntity.customer, contractEntity, serverUrl)
//             if (!mailResult.rs) {
//                 CLog.bad('Error in sendContractEmail')
//                 return res.send({rs: false, message: mailResult.message})
//             }
//
//             contractEntity.status = 'sent'
//             await contractEntity.save()
//
//             return res.send({rs: true, message: 'OK', data: mailResult.data.data})
//         } catch (e) {
//             CLog.bad('Error in sendContractEmail', e.message)
//             return res.send({rs: false, message: `send contract email error`})
//         }
//     }
//
//     static async generateUnsignedContractPdf(req: Request, res: Response) {
//         const {uid, cid}: ContractAndUserIdDto = req.body.dto
//
//         const contract = await gDB.getRepository(Contract).findOne({
//             relations: ['customer', 'sales', 'head'],
//             where: {cid: cid, isDelete: false, customer: {id: +uid}}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//
//         const currentDate = moment().format('L')
//         const serverBaseUrl = `http://localhost:${process.env.HTTP_PORT}`
//
//         if (contract && contract.modifiedContractBody.length > 0) {
//             const dom = new JSDOM(`<!DOCTYPE html><body>${contract.modifiedContractBody}</body>`)
//             let elements = dom.window.document.querySelectorAll('.term')
//
//
//             // @ts-ignore
//             let htmlElements: Element = Array.from(
//                 dom.window.document.getElementsByClassName('term')
//             )
//             const ids = htmlElements.map(term => Number(term.getAttribute('data-id')))
//
//             if (ids.length > 0) {
//                 const termList = await gDB.getRepository(ContractTerm)
//                     .find({where: {id: In(ids)}})
//
//                 elements.forEach((v, i) => v.innerHTML = termList.find(value => value.id === ids[i])?.text)
//                 let text = dom.window.document.getElementsByTagName('body')[0].outerHTML
//                 contract.modifiedContractBody = text.substring(6, text.length - 7)
//             }
//
//         }
//
//         // generate pdf
//         const pdfResult = await createContractPdfFileFromHtml(contract, contract.customer.id, currentDate,
//             null, serverBaseUrl, false, {name: contract.head?.partyBName || ''})
//         if (!pdfResult) {
//             CLog.bad('Error in createContractPdfFileFromHtml')
//             return res.send({rs: false, message: 'Cannot generate contract file'})
//         }
//
//
//         try {
//             const fileName = `${cid}_unsigned.pdf`
//             const fullPath = await getAbsoluteFilePath(fileName, FileType.UserContract, contract.customer.id)
//             if (!fs.existsSync(fullPath)) {
//                 return sendResError(res, ResError.NotFound)
//             }
//             return res.download(fullPath, fileName)
//         } catch (e) {
//             CLog.bad('Error in generateUnsignedContractPdf', e)
//             return res.send({rs: false, message: ErrStr.CreateDataError})
//         }
//     }
//
//     static async signContract(req: Request, res: Response) {
//         const {cid, uid, signature}: SignContractDto = req.body.dto
//
//         const contract = await gDB.getRepository(Contract).findOne({
//             relations: ['customer', 'sales', 'head'],
//             where: {cid: cid, isDelete: false, customer: {id: +uid}}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//
//         const currentDate = moment().format('L')
//         const serverBaseUrl = `http://localhost:${process.env.HTTP_PORT}`
//
//         // generate pdf
//         let b64SignatureImg = noSignatureB64
//         try {
//             const fullPath = await getAbsoluteFilePath(contract.head?.partyBSignature, FileType.ContractSignatureImage)
//             if (!fs.existsSync(fullPath)) {
//                 CLog.bad('Error: Signature not found')
//             } else {
//                 const bitmap = fs.readFileSync(fullPath)
//                 b64SignatureImg = 'data:image/png;base64,' + bitmap.toString('base64')
//             }
//         } catch (e) {
//             CLog.bad('Signature Error:', e.message)
//         }
//         const partyBDetails = {name: contract.head?.partyBName, signature: b64SignatureImg}
//         try {
//             const pdfResult = await createContractPdfFileFromHtml(contract, contract.customer.id, currentDate, signature, serverBaseUrl, true, partyBDetails)
//             if (!pdfResult) {
//                 return res.send({rs: false, message: 'Cannot generate contract file'})
//             }
//
//             contract.signedDate = new Date()
//             contract.status = 'signed'
//             await contract.save()
//
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error in signContract', e)
//             return res.send({rs: false, message: `Error in signContract`})
//         }
//     }
//
//     static async confirmContract(req: Request, res: Response) {
//         const {cid}: ContractCidDto = req.body.dto
//
//         const contract = await gDB.getRepository(Contract).findOne({
//             relations: ['mainContract', 'customer'],
//             where: {cid, isDelete: false, status: 'signed'}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//
//         contract.confirmedDate = new Date()
//         contract.status = 'done'
//         await contract.save()
//
//         let result
//         if (!contract.isMain) {
//             result = {
//                 isMain: contract.isMain,
//                 mainContract: contract.mainContract.cid,
//                 customer: contract.customer.id
//             }
//         } else {
//             result = {
//                 isMain: contract.isMain
//             }
//         }
//         return res.send({rs: true, message: 'OK', data: result})
//     }
//
//     static async uploadContractFile(req: Request, res: Response) {
//         const fileDto: UploadContractFileDto = req.body.dto
//
//         // Test if file exists and file params
//         if (!req.files || !req.files.file) {
//             return res.send({rs: false, message: 'No file selected or uploaded with wrong parameters'})
//         }
//         const uploadFile = req.files.file as UploadedFile
//         const [isFileCheckNotPass, message] = await checkFileIsOverSize(uploadFile, 'max_file_size')
//         if (isFileCheckNotPass) {
//             return res.send({rs: false, message: `File must be less than ${message}`})
//         }
//
//         // Test if contract exists
//         const contract = await gDB.getRepository(Contract).findOne({
//             relations: ['customer'],
//             where: {cid: fileDto.cid, isDelete: false, isMain: true, customer: {id: +fileDto.uid}}
//         })
//         if (!contract) {
//             return res.send({rs: false, message: 'Contract not found '})
//         }
//
//         if (uploadFile && !Array.isArray(uploadFile)) {
//             let savedFileUrl = ''
//             let fileMime = uploadFile.mimetype
//             try {
//                 savedFileUrl = await saveFile(uploadFile, FileType.UserContractFile, contract.customer.id)
//             } catch (e) {
//                 CLog.bad('Error in uploadContractFile', e)
//                 return res.send({rs: false, message: `Error in uploadContractFile`})
//             }
//
//             // Create entry
//             try {
//                 await gDB.getRepository(ContractFile).create({
//                     name: fileDto.name,
//                     description: fileDto.description,
//                     fileName: savedFileUrl,
//                     mime: fileMime,
//                     contract: contract
//                 }).save()
//                 return res.send({rs: true, data: {uid: contract.customer.id, cid: contract.cid}})
//             } catch (e) {
//                 CLog.bad('Error in uploadContractFile', e)
//                 return res.send({rs: false, message: 'Error in uploadContractFile'})
//             }
//         }
//         return res.send({rs: false, message: 'The file uploaded is not supported'})
//     }
//
//     static async deleteContractFile(req: Request, res: Response) {
//         const {cid, uid, fileUid}: GetContractFileDto = req.body.dto
//
//         try {
//             const contractFile = await gDB.getRepository(ContractFile)
//                 .createQueryBuilder('file')
//                 .leftJoinAndSelect('file.contract', 'contract')
//                 .leftJoinAndSelect('contract.customer', 'customer')
//                 .where('file.isDelete=false')
//                 .andWhere('file.uid=:fileUid', {fileUid})
//                 .andWhere('contract.cid=:cid', {cid})
//                 .andWhere('customer.id=:uid', {uid})
//                 .getOne()
//
//             if (!contractFile) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             const fileName = contractFile.fileName
//             const newFileName = `deleted_${fileName}`
//             const renameRes = await renameFile(fileName, newFileName, FileType.UserContractFile, uid)
//             if (renameRes) {
//                 contractFile.fileName = newFileName
//                 contractFile.isDelete = true
//                 contractFile.isActive = false
//                 await contractFile.save()
//                 return res.send({rs: true, message: 'OK'})
//             }
//
//         } catch (e) {
//             CLog.bad('Error in deleteContractFile', e.message)
//             return res.send({rs: false, message: 'Error in deleteContractFile'})
//         }
//     }
//
//     static async getContractFile(req: Request, res: Response) {
//         const {cid, uid, fileUid}: GetContractFileDto = req.body.dto
//
//         try {
//             const contractFile = await gDB.getRepository(ContractFile)
//                 .createQueryBuilder('file')
//                 .leftJoinAndSelect('file.contract', 'contract')
//                 .leftJoinAndSelect('contract.customer', 'customer')
//                 .where('file.isDelete=false')
//                 .andWhere('file.uid=:fileUid', {fileUid})
//                 .andWhere('contract.cid=:cid', {cid})
//                 .andWhere('customer.id=:uid', {uid})
//                 .getOne()
//
//             if (!contractFile) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             if (contractFile && contractFile.fileName) {
//                 const fullPath = await getAbsoluteFilePath(contractFile.fileName, FileType.UserContractFile, uid)
//                 if (!fs.existsSync(fullPath)) {
//                     return res.send({rs: false, message: 'File not found'})
//                 }
//                 return res.download(fullPath, contractFile.fileName)
//             } else {
//                 return res.send({rs: false, message: 'File not found'})
//             }
//
//         } catch (e) {
//             CLog.bad('Error in getContractFile', e.message)
//             return res.send({rs: false, message: 'Error in getContractFile'})
//         }
//     }
//
//     static async getContractPdf(req: Request, res: Response) {
//         const {cid}: ContractCidDto = req.body.dto
//
//         try {
//             const contract = await gDB.getRepository(Contract).findOne({
//                 relations: ['customer'],
//                 where: {cid: cid, isDelete: false}
//             })
//
//             const fileName = `${cid}.pdf`
//             if (contract && contract.signedDate) {
//                 const fullPath = await getAbsoluteFilePath(fileName, FileType.UserContract, contract.customer.id)
//                 if (!fs.existsSync(fullPath)) {
//                     return sendResError(res, ResError.NotFound)
//                 }
//                 return res.download(fullPath, fileName)
//             } else sendResError(res, ResError.NotFound)
//         } catch (e) {
//             CLog.bad('Error in getContractPdf', e.message)
//             return sendResError(res, ResError.InternalServerError, `Error in get contract`)
//         }
//     }
//
//     static async fetchContractNote(req: Request, res: Response) {
//         const {cid} = req.params
//
//         try {
//             const foundNotes = await gDB.getRepository(Notes)
//                 .createQueryBuilder('notes')
//                 .leftJoinAndSelect('notes.contract', 'contract')
//                 .leftJoinAndSelect('notes.user', 'user')
//                 .where('notes.isDelete=false')
//                 .andWhere('contract.isDelete=false')
//                 .andWhere('contract.cid=:cid', {cid})
//                 .select(['notes', 'user.firstName', 'user.lastName'])
//                 .orderBy('notes.createdAt', 'DESC')
//                 .getMany()
//
//             return res.send({rs: true, data: foundNotes})
//         } catch (e) {
//             CLog.bad('Contract not found', e.message)
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//     }
//
//     static async createContractNote(req: Request, res: Response) {
//         const {cid, notes}: CreateContractNoteDto = req.body.dto
//         const {id} = req.body.validatedData.user
//
//         const foundContract = await gDB.getRepository(Contract).findOne({where: {cid, isDelete: false}})
//         if (!foundContract) {
//             CLog.bad('Contract not found', id, cid, notes)
//             return res.send({rs: false, message: 'Contract not found'})
//         }
//
//         try {
//             await gDB.getRepository(Notes).create({
//                 user: id,
//                 contract: foundContract,
//                 notes
//             }).save()
//
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error in createContractNote', e.message)
//             return res.send({rs: false, message: 'Error in createContractNote'})
//         }
//     }
//
//     static async editContractNote(req: Request, res: Response) {
//         const {id, cid, notes}: EditContractNoteDto = req.body.dto
//
//         const foundNote = await gDB.getRepository(Notes)
//             .createQueryBuilder('notes')
//             .leftJoinAndSelect('notes.contract', 'contract')
//             .where('notes.isDelete=false')
//             .andWhere('notes.id=:id', {id})
//             .andWhere('contract.isDelete=false')
//             .andWhere('contract.cid=:cid', {cid})
//             .getOne()
//         if (!foundNote) {
//             CLog.bad(`ID not found ${id}  ${cid}`)
//             return res.send({rs: false, message: 'ID not found'})
//         }
//
//         try {
//             foundNote.notes = notes
//             await foundNote.save()
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error in editContractNote', e.message)
//             return res.send({rs: false, message: 'Error in editContractNote'})
//         }
//     }
//
//     static async deleteContractNote(req: Request, res: Response) {
//         const {id, cid} = req.params
//
//         const foundNote = await gDB.getRepository(Notes)
//             .createQueryBuilder('notes')
//             .leftJoinAndSelect('notes.contract', 'contract')
//             .where('notes.isDelete=false')
//             .andWhere('notes.id=:id', {id})
//             .andWhere('contract.isDelete=false')
//             .andWhere('contract.cid=:cid', {cid})
//             .getOne()
//
//         if (!foundNote) {
//             CLog.bad(`ID not found ${id}  ${cid}`)
//             return res.send({rs: false, message: 'ID not found'})
//         }
//
//         try {
//             foundNote.isDelete = true
//             foundNote.isActive = false
//             await foundNote.save()
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad(`Error in save notes, `, e.message)
//             return res.send({rs: false, message: `Error in save notes`})
//         }
//     }
//
//
//     // TODO: zhou
//     static async fetchContractByCustomer(req: Request, res: Response) {
//         const {uid} = req.params
//         if (!uid) {
//             CLog.bad((`Missing params: uid, but got ${uid}`))
//             return res.send({rs: false, message: 'Missinng params'})
//         }
//
//         try {
//             let contract = await gDB.getRepository(Contract).find({
//                 relations: ['customer', 'mainContract'],
//                 where: {isDelete: false, isActive: true, status: 'done', customer: {id: +uid}}
//             })
//             if (!contract) {
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             contract = contract.map(co => {
//                 delete co.text
//                 delete co.customer
//                 if (co.mainContract) {
//                     delete co.mainContract.text
//                 }
//                 return co
//             })
//
//             return res.send({rs: true, data: contract})
//         } catch (e) {
//             CLog.bad('Error in fetchContractByCustomer', e)
//             return res.send({rs: false, message: 'Error occurred when find contract'})
//         }
//     }
//
//     static async fetchAllProductContractSales(req: Request, res: Response) {
//         try {
//             const {timeIntervalType, timeIntervalStart, timeIntervalEnd}: ContractChartDto = req.body.dto
//
//             const contractsQuery = await ChartQueryContract(timeIntervalStart, timeIntervalEnd)
//             if (!contractsQuery.rs) {
//                 // failure
//                 return res.send(contractsQuery)
//             }
//
//             const contracts = contractsQuery.data
//             let productInfo = {}
//             contracts.forEach((contract) => {
//                 if (!productInfo[contract.contract_name]) {
//                     productInfo[contract.contract_name] = []
//                 }
//                 productInfo[contract.contract_name].push(contract)
//             })
//
//             let result = {}
//             for (let product of Object.keys(productInfo)) {
//                 productInfo[product].forEach((contract) => {
//                     if (!result[contract.contract_name]) {
//                         result[contract.contract_name] = {
//                             name: contract.contract_name,
//                             quantity: newChartReturnArray(timeIntervalType, timeIntervalStart, timeIntervalEnd),
//                             price: parseFloat(contract.contract_price),
//                             totalSales: newChartReturnArray(timeIntervalType, timeIntervalStart, timeIntervalEnd),
//                             date: []
//                         }
//                     }
//                     const index = getMomentIndex(timeIntervalType, timeIntervalStart, contract.contract_confirmedDate)
//                     result[contract.contract_name].date.push(contract.contract_confirmedDate)
//                     result[contract.contract_name].quantity[index] += 1
//                     result[contract.contract_name].totalSales[index] += parseFloat(contract.contract_price)
//                 })
//             }
//
//             return res.send({rs: true, data: result})
//
//         } catch (e) {
//             CLog.bad('Error in fethAllProductContractSales', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async fetchTotalContractSales(req: Request, res: Response) {
//         try {
//             const {timeIntervalType, timeIntervalStart, timeIntervalEnd}: ContractChartDto = req.body.dto
//
//             const contractsQuery = await ChartQueryContract(timeIntervalStart, timeIntervalEnd)
//             if (!contractsQuery.rs) {
//                 // failure
//                 return res.send(contractsQuery)
//             }
//
//             const contracts = contractsQuery.data
//             const customers = await super.queryBuilderAndLeftJoin(User, ['sales'])
//                 .queryBuilder
//                 .where('user.isDelete=false')
//                 .andWhere('user.isStaff=false')
//                 .andWhere('user.createdAt> :timeIntervalStart', {timeIntervalStart: req.body.timeIntervalStart})
//                 .andWhere('user.createdAt<= :timeIntervalEnd', {timeIntervalEnd: req.body.timeIntervalEnd})
//                 .getRawMany()
//             let result = {
//                 quantity: newChartReturnArray(timeIntervalType, timeIntervalStart, timeIntervalEnd),
//                 totalSales: newChartReturnArray(timeIntervalType, timeIntervalStart, timeIntervalEnd),
//                 newCustomer: newChartReturnArray(timeIntervalType, timeIntervalStart, timeIntervalEnd)
//             }
//             contracts.forEach((contract) => {
//                 const index = getMomentIndex(timeIntervalType, timeIntervalStart, contract.contract_confirmedDate)
//                 result.quantity[index] += 1
//                 result.totalSales[index] += parseFloat(contract.contract_price)
//             })
//             customers.forEach((customer) => {
//                 const index = getMomentIndex(timeIntervalType, timeIntervalStart, customer.user_createdAt)
//                 result.newCustomer[index] += 1
//             })
//             return res.send({rs: true, data: result})
//         } catch (e) {
//             CLog.bad('Error in fetchTotalContractSales', e.message)
//             return res.send({rs: false, message: 'Error in fetchTotalContractSales'})
//         }
//     }
//
//
//     // Commissions
//     static async fetchAllCommissions(req: Request, res: Response) {
//         try {
//             const {cid} = req.params
//             const foundCommissions = await super.queryBuilderAndLeftJoin(ContractCommission, ['contract'])
//                 .queryBuilder
//                 .where('contract.cid = :cid', {cid})
//                 .getMany()
//             return res.send({rs: true, data: foundCommissions})
//         } catch (e) {
//             CLog.bad('Error in fetchAllCommissions', e.message)
//             return res.send({rs: false, message: 'Error in fetchAllCommissions'})
//         }
//     }
//
//     static async createContractCommission(req: Request, res: Response) {
//         try {
//             const {cid, price, notes, status}: CreateOrUpdateContractCommissionDto = req.body.dto
//             const foundContract = await super.queryBuilderAndLeftJoin(Contract, ['customer', 'sales'])
//                 .queryBuilder
//                 .where('contract.cid = :cid', {cid})
//                 .getOne()
//
//             if (!foundContract) {
//                 CLog.bad('Contract not found', cid, price, notes)
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             const newCommission = await super.repo(ContractCommission).create({
//                 price, notes, status, contract: foundContract, sales: foundContract.sales
//             }).save()
//
//             return res.send({rs: true, data: newCommission})
//         } catch (e) {
//             CLog.bad('Error in createContractCommission', e.message)
//             return res.send({rs: false, message: 'Error in createContractCommission'})
//         }
//     }
//
//     static async updateContractCommission(req: Request, res: Response) {
//         try {
//             const id = +req.params.id
//             const {price, notes, status}: CreateOrUpdateContractCommissionDto = req.body.dto
//             const foundCommission = await super.repo(ContractCommission).findOne({
//                 where: {id},
//                 relations: ['contract']
//             })
//
//             if (!foundCommission) {
//                 CLog.bad('Error in fethAllProductContractSales')
//                 return res.send({rs: false, message: 'Commission not found'})
//             }
//
//             foundCommission.price = price
//             foundCommission.notes = notes
//             foundCommission.status = status
//
//             await foundCommission.save()
//
//             return res.send({rs: true, data: foundCommission})
//         } catch (e) {
//             CLog.bad('Error in updateContractCommission', e.message)
//             return res.send({rs: false, message: 'Error in updateContractCommission'})
//         }
//     }
//
//     //Payments
//     static async createPaymentEmail(req: Request, res: Response) {
//         try {
//             const {fname, lname, email, cid} = req.body
//             if (!fname || !email || !cid) {
//                 CLog.bad('Error in createPaymentEmail, Invalid, missing input(s).')
//                 return res.send({rs: false, message: 'Invalid, missing input(s).'})
//             }
//             if (typeof (fname) !== 'string' || typeof (email) !== 'string' || typeof (cid) !== 'string') {
//                 CLog.bad('Error in createPaymentEmail, Invalid, input type(s).')
//                 return res.send({rs: false, message: 'Invalid, input type(s)'})
//             }
//
//             const foundContract = await super.repo(Contract).findOne({
//                 where: {
//                     cid: cid
//                 }
//             })
//             if (!foundContract) {
//                 CLog.bad('Error in createPaymentEmail')
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//             const existingEmail = foundContract.paymentEmails.find(element => element.email === email)
//             if (!!existingEmail) {
//                 CLog.bad('Error in createPaymentEmail')
//                 return res.send({rs: false, message: 'Existing same email for this contract'})
//             }
//
//             let paymentEmail: ContractPaymentEmails = new ContractPaymentEmails()
//             paymentEmail.email = email
//             paymentEmail.fname = fname
//             paymentEmail.lname = lname
//             let error = await validate(paymentEmail)
//
//             if (error.length > 0) {
//                 CLog.bad('Error in createPaymentEmail')
//                 return res.send({rs: false, message: 'Please make sure you input first name and correct email address'})
//             }
//             const foundEmail = await super.repo(ContractPaymentEmails).findOne({
//                 where: {
//                     email: email
//                 }
//             })
//             if (!foundEmail) {
//                 await super.repo(ContractPaymentEmails).save(paymentEmail)
//                 foundContract.paymentEmails.push(paymentEmail)
//
//             } else {
//                 if (
//                     foundEmail.fname !== fname || foundEmail.lname !== lname
//                 ) {
//                     CLog.bad('Error in createPaymentEmail')
//                     return res.send({
//                         rs: false, message: `Incorrect name, email has firstName ${foundEmail.fname}
//                     and lastName ${foundEmail.lname} recorded on file, do you mean to update the names?`
//                     })
//                 }
//                 foundContract.paymentEmails.push(foundEmail)
//             }
//             await super.repo(Contract).save(foundContract)
//
//             return res.send({rs: true, data: foundContract})
//         } catch (e) {
//             CLog.bad('Error in createPaymentEmail', e.message)
//             return res.send({rs: false, message: 'Error in createPaymentEmail'})
//         }
//     }
//
//
//     static async updatePaymentEmail(req: Request, res: Response) {
//         try {
//             // find the existing email by id
//             const {fname, lname, email, cid, id} = req.body
//             if (!fname || !email || !cid) {
//                 CLog.bad('Error in updatePaymentEmail, Invalid, missing input(s).')
//                 return res.send({rs: false, message: 'Invalid, missing input(s).'})
//             }
//             if (typeof (fname) !== 'string' || typeof (email) !== 'string' || typeof (cid) !== 'string') {
//                 CLog.bad('Error in updatePaymentEmail, Invalid, input type(s).')
//                 return res.send({rs: false, message: 'Invalid, input type(s)'})
//             }
//
//
//             const foundContract = await super.repo(Contract).findOne({
//                 where: {
//                     cid: cid
//                 }
//             })
//             // check if the contract exists
//             if (!foundContract) {
//                 CLog.bad('Error in updatePaymentEmail')
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             // delete the many-to-many relation array
//             const remainingEmails = foundContract.paymentEmails.filter(element => element.id !== id)
//             foundContract.paymentEmails = remainingEmails
//
//             // update the existing email, lname and fname
//             let paymentEmail: ContractPaymentEmails = new ContractPaymentEmails()
//             paymentEmail.email = email
//             paymentEmail.fname = fname
//             paymentEmail.lname = lname
//
//             let error = await validate(paymentEmail)
//             if (error.length > 0) {
//                 CLog.bad('Error in updatePaymentEmail')
//                 return res.send({rs: false, message: 'Please make sure you input first name and correct email address'})
//             }
//             const foundEmail = await super.repo(ContractPaymentEmails).findOne({
//                 where: {
//                     email: email
//                 }
//             })
//             if (!foundEmail) {
//                 await super.repo(ContractPaymentEmails).save(paymentEmail)
//                 foundContract.paymentEmails.push(paymentEmail)
//             } else {
//                 foundEmail.email = email
//                 foundEmail.fname = fname
//                 foundEmail.lname = lname
//                 await super.repo(ContractPaymentEmails).save(foundEmail)
//                 foundContract.paymentEmails.push(foundEmail)
//             }
//             await super.repo(Contract).save(foundContract)
//             return res.send({rs: true, data: foundContract})
//         } catch (e) {
//             CLog.bad('Error in updatePaymentEmail', e.message)
//             return res.send({rs: false, message: 'Error in updatePaymentEmail'})
//         }
//     }
//
//
//     static async deletePaymentEmail(req: Request, res: Response) {
//         try {
//             // find the existing email by id
//             const {cid, id} = req.body
//             if (!cid || !id) {
//                 CLog.bad('Error in deletePaymentEmail, Invalid, missing input(s).')
//                 return res.send({rs: false, message: 'Invalid, missing input(s).'})
//             }
//             if (typeof (id) !== 'number' || typeof (cid) !== 'string') {
//                 CLog.bad('Error in deletePaymentEmail, Invalid, input type(s).')
//                 return res.send({rs: false, message: 'Invalid, input type(s)'})
//             }
//
//             const foundContract = await super.repo(Contract).findOne({
//                 where: {
//                     cid: cid
//                 }
//             })
//             // check if the contract exists
//             if (!foundContract) {
//                 CLog.bad('Error in deletePaymentEmail')
//                 return res.send({rs: false, message: 'Contract not found'})
//             }
//
//             // delete the many-to-many relation array
//             const remainingEmails = foundContract.paymentEmails.filter(element => element.id !== id)
//             foundContract.paymentEmails = remainingEmails
//             await super.repo(Contract).save(foundContract)
//             return res.send({rs: true, data: foundContract})
//         } catch (e) {
//             CLog.bad('Error in deletePaymentEmail', e.message)
//             return res.send({rs: false, message: 'Error in deletePaymentEmail'})
//         }
//     }
//
//
//     static async createContractPaymentHistory(req: Request, res: Response) {
//
//         const pictures = req.files
//
//         const {
//             cid, email, amount, paymentLog, payerName, currency,
//             receiveTime, phoneNumber, paymentType, conversionRate, noteInJson
//         }: CreatePaymentHistoryDto = req.body.dto
//
//
//         const queryRunner = gDB.createQueryRunner()
//         await queryRunner.startTransaction()
//
//
//         try {
//             const amountInCents = convertToCents(amount)
//             //found contract
//             let contractFound = await gDB.getRepository(Contract).findOne({
//                 where: {cid: cid}
//             })
//             if (!contractFound) {
//                 CLog.bad('Error in createContractPaymentHistory')
//                 return res.send({rs: false, message: 'Contract was not found'})
//             }
//             if (amountInCents <= 0) {
//                 CLog.bad('Error in createContractPaymentHistory')
//                 return res.send({rs: false, message: 'the amount has to be bigger than 0'})
//             }
//             if (amountInCents > contractFound.remaining) {
//                 CLog.bad('Error in createContractPaymentHistory')
//                 return res.send({
//                     rs: false,
//                     message: `the amount should be less or equal to ${contractFound.remaining / 100}`
//                 })
//             }
//             if (contractFound.remaining === 0) {
//                 CLog.bad('Error in createContractPaymentHistory')
//                 return res.send({rs: false, message: 'Not Valid, This contract is fully paid'})
//             }
//             if (parseFloat(conversionRate) <= 0) {
//                 CLog.bad('Error in createContractPaymentHistory')
//                 return res.send({rs: false, message: 'Invalid conversionRate'})
//             }
//
//
//             let contractPaymentHistory: ContractPaymentHistory = new ContractPaymentHistory()
//             contractPaymentHistory.cid = cid
//             contractPaymentHistory.email = email
//             contractPaymentHistory.amount = amountInCents
//             // contractPaymentHistory.contractPaymentLog = null
//             contractPaymentHistory.contract = contractFound
//             contractPaymentHistory.paymentType = paymentType as PaymentTypes
//             contractPaymentHistory.currency = currency as Currency
//             contractPaymentHistory.payerName = payerName
//             contractPaymentHistory.phoneNumber = phoneNumber
//             contractPaymentHistory.receiveTime = receiveTime
//             contractPaymentHistory.conversionRate = conversionRate
//             contractPaymentHistory.referenceNumber = 'N/A'
//             // contractPaymentHistory.html = "N/A"
//             contractPaymentHistory.amountInCAD = convertToCents(JSON.stringify(parseFloat(amount) * parseFloat(conversionRate)))
//
//             let error = await validate(contractPaymentHistory)
//             if (error.length > 0) {
//                 await queryRunner.release()
//                 CLog.bad('Error in createContractPaymentHistory, Input validate errors ')
//                 return res.send({rs: false, message: 'Save validate errors'})
//             }
//
//
//             contractFound.remaining -= contractPaymentHistory.amount
//             await gDB.getRepository(Contract).save(contractFound)
//             await gDB.getRepository(ContractPaymentHistory).save(contractPaymentHistory)
//
//             const [savedPaymentPics, savedPaymentNotes] =
//                 await Promise.all(
//                     [ContractController.__savePaymentHistoryPictures(pictures, contractPaymentHistory, cid),
//                         ContractController.__savePaymentHistoryNotes(noteInJson, contractPaymentHistory, cid)])
//
//             if (!savedPaymentPics.rs) {
//                 await queryRunner.rollbackTransaction()
//                 await queryRunner.release()
//                 return res.send({rs: false, message: 'save payment history pictures error' + savedPaymentPics.message})
//             }
//             if (!savedPaymentNotes.rs) {
//                 await queryRunner.rollbackTransaction()
//                 await queryRunner.release()
//                 return res.send({rs: false, message: 'save payment history notes error' + savedPaymentNotes.message})
//             }
//
//             await queryRunner.commitTransaction()
//             await queryRunner.release()
//             return res.send({rs: true, message: `Successfully saved payment history!`})
//         } catch (e) {
//             await queryRunner.rollbackTransaction()
//             await queryRunner.release()
//             CLog.bad('Error in createContractPaymentHistory', e.message)
//             return res.send({rs: false, message: ErrStr.CreateDataError})
//         }
//     }
//
//     // Payment Logs
//     static async getAllPaymentLogs(req: Request, res: Response) {
//         let allPaymentLogsInCent: any
//         try {
//
//             allPaymentLogsInCent = await super.repo(ContractPaymentLogs).find()
//             let allPaymentLogs = []
//             // allPaymentLogs = allPaymentLogsInCent.map((paymentLogInCent) => {
//             //     let temp = {...paymentLogInCent}
//             //     temp.transferAmount = temp.transferAmount / 100
//             //     temp.amountInCAD = temp.amountInCAD / 100
//             //     temp.usedAmount = temp.usedAmount / 100
//             //     temp.unusedAmount = temp.unusedAmount / 100
//             //     return temp
//             // })
//             return res.send({rs: true, data: allPaymentLogsInCent})
//         } catch (e) {
//             CLog.bad('Error in getAllPaymentLogs', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//
//     // static async __linkRecommendedContract(paymentlogs: ContractPaymentLogs[]): Promise<Object[]>{
//     //     const recommends = await Promise.all(paymentlogs.map(log=>{
//     //
//     //         // const temp = _.takeRight(log.payerName.split(' '),2)
//     //         // let firstName:string = ''
//     //         // let lastName:string = ''
//     //         // if(temp.length === 2){
//     //         //     firstName = temp[0]
//     //         //     lastName = temp[1]
//     //         // }
//     //         const temp = log.payerName.trim().split(' ')
//     //         if (temp.length === 0){
//     //             return []
//     //         }
//     //         try{
//     //             const foundContracts = gDB.getRepository(Contract)
//     //                 .createQueryBuilder('contract')
//     //                 .leftJoinAndSelect('contract.customer','user')
//     //                 .where('contract.isActive = true AND contract.remaining > 0 AND (contract.email = :email OR contract.email LIKE :likeEmail OR (user.firstName  IN (:temp) AND user.lastName IN (:temp)))',
//     //                     {email:log.replyTo, likeEmail:`%${log.replyTo.split('@')[0]}%`, temp:temp})
//     //                 .getMany()
//     //             return foundContracts
//     //         }catch (e){
//     //             CLog.bad('error in __linkRecommendedContract',e.message)
//     //             return []
//     //         }
//     //     }))
//     //
//     //     const res = recommends.map((e,i) =>{
//     //         return {...paymentlogs[i],recommend:e}
//     //     })
//     //
//     //     return res
//     // }
//     static async getAllPaymentLogsByPage(req: Request, res: Response) {
//         const {page, perPage, sortColumn, sortOrder, searchKey, previous, next}: BasePaginationDto = req.body
//         const processStatus = req.body.processStatus
//         const processStatusArr = ['processed', 'unprocessed', 'manual', 'pending', 'partially_processed', 'no_contract', 'all']
//
//         if (!!processStatus && !processStatusArr.includes(processStatus)) {
//             return res.send({rs: false, message: 'Please provide a valid process status'})
//         }
//         try {
//             let {queryBuilder, alias} = super.queryBuilderAndLeftJoin(ContractPaymentLogs, ['paymentHistories'])
//             if (!!processStatus && processStatus !== 'all') {
//                 queryBuilder = queryBuilder.where({processStatus: processStatus})
//             }
//             let searchCols = dotConcatList(
//                 [
//                     {entity: alias, property: 'transferCurrency'},
//                     {entity: alias, property: 'payerName'},
//                     {entity: alias, property: 'referenceNumber'},
//                     {entity: alias, property: 'processStatus'},
//                     {entity: alias, property: 'replyTo'}
//                 ]
//             )
//             searchCols = [...searchCols, ...super.searchCols(ContractPaymentLogs).map(col => dotConcat(alias, col))]
//
//             const props: PaginationParams = {
//                 queryBuilder,
//                 entity: ContractPaymentLogs,
//                 page,
//                 perPage,
//                 sortCol: dotConcat(alias, sortColumn),
//                 sortOrder,
//                 searchCols,
//                 searchKey,
//                 previous,
//                 next,
//                 defaultSortCol: dotConcat(alias, 'id'),
//                 defaultSearchCol: dotConcat(alias, 'id')
//             }
//             let result = await fetchPaginatedData(props)
//             // result.data = await ContractController.__linkRecommendedContract(result.data) as Object[]
//             // Pass list of ids to matrix to get their roles
//             return res.send(result)
//         } catch (e) {
//             return res.send({rs: false, message: e.message})
//         }
//     }
//
//
//     // Methods below are for the Contract Currency Entity
//
//     static async fetchAllCurrency(req: Request, res: Response, next: NextFunction) {
//         try {
//             let allCurrency = await super.repo(ContractCurrency).find()
//             return res.send({rs: true, data: allCurrency})
//         } catch (e) {
//             CLog.bad('Error in fetchAllCurrency', e.message)
//             return res.send({rs: false, message: 'Error in fetchAllCurrency'})
//         }
//     }
//
//
//     // In order to add a currency, you need to make the change to the Currency enum in the consts
//     // helper file
//     static async __addCurrency(req: Request, res: Response, next: NextFunction) {
//
//         try {
//             let newCurrency: ContractCurrency = req.body.currency
//             let tempCurrency = await super.repo(ContractCurrency).create({
//                 currency: newCurrency
//             }).save()
//             if (!tempCurrency) return null
//             CLog.bad('Error in __addCurrency')
//             return res.send({rs: true, message: `inserted currency ${newCurrency}`})
//         } catch (e) {
//             CLog.bad('Error in __addCurrency', e.message)
//             return res.send({rs: false, message: `Please change the Currency Enum in consts file first`})
//         }
//     }
//
//     // handle the contract payment history entry's uploaded files
//     static async __savePaymentHistoryPictures(pictures, contractPaymentHistory: ContractPaymentHistory, cid):
//         Promise<{rs: boolean, message?: string, data?: ContractPaymentHistoryPictures[]}> {
//
//         try {
//             // save notes and pictures for the payment history entry to notes and pictures tables
//             // check the structure of picture array
//             const pictureList = []
//             for (const picture in pictures) {
//                 let picFile = pictures[picture]
//                 if (!picture || !picFile) {
//                     CLog.bad('Error in createContractPaymentHistory, No file received')
//                     // return sendResError(res, ResError.InternalServerError, "No file received")
//                     return {rs: false, message: ResError.InternalServerError + 'No file received'}
//                 }
//                 if (Array.isArray(picFile)) {
//                     picFile = picFile[0]
//                 }
//                 const saveResult = await ContractController.__handleContractPaymentFile(picFile, contractPaymentHistory.id)
//                 if (!saveResult.rs) {
//                     return {rs: false, message: saveResult.message}
//                 }
//
//                 let paymentPicture: ContractPaymentHistoryPictures = new ContractPaymentHistoryPictures()
//                 paymentPicture.cid = cid
//                 paymentPicture.contractPaymentHistory = contractPaymentHistory
//                 paymentPicture.file = saveResult.data
//                 paymentPicture.fileName = picFile['name']
//                 paymentPicture.mime = picFile['mimetype']
//                 paymentPicture.size = picFile['size']
//                 pictureList.push(gDB.getRepository(ContractPaymentHistoryPictures).create({
//                     ...paymentPicture
//                 }))
//             }
//             await super.repo(ContractPaymentHistoryPictures)
//                 .createQueryBuilder()
//                 .insert()
//                 .into(ContractPaymentHistoryPictures)
//                 .values(pictureList)
//                 .execute()
//
//             return {rs: true, data: pictureList}
//
//         } catch (e) {
//             CLog.bad('Error in __savePaymentHistoryPictures', e.message)
//             return {rs: false, message: 'Error in __handleContractPaymentFile'}
//         }
//     }
//
//     static async __savePaymentHistoryNotes(noteInJson, contractPaymentHistory: ContractPaymentHistory, cid):
//         Promise<{rs: boolean, message?: string, data?: ContractPaymentHistoryNotes[]}> {
//         const note = JSON.parse(noteInJson)
//
//         try {
//             //save related payment history notes
//
//
//             if (!note || note.length === 0) {
//                 CLog.bad('Error in createContractPaymentHistory, No notes received')
//                 return {rs: false, message: ResError.InternalServerError + 'No notes received'}
//
//             }
//
//             const noteList = []
//             for (const noteEle of note) {
//                 let paymentNotes: ContractPaymentHistoryNotes = new ContractPaymentHistoryNotes()
//                 paymentNotes.cid = cid
//                 paymentNotes.contractPaymentHistory = contractPaymentHistory
//                 paymentNotes.note = noteEle
//                 noteList.push(gDB.getRepository(ContractPaymentHistoryNotes).create({
//                     ...paymentNotes
//                 }))
//             }
//             await gDB
//                 .createQueryBuilder()
//                 .insert()
//                 .into(ContractPaymentHistoryNotes)
//                 .values(noteList)
//                 .execute()
//             return {rs: true, data: noteList}
//         } catch (e) {
//             CLog.bad('Error in createContractPaymentHistoryNotes', e.message)
//             return {rs: false, message: ResError.InternalServerError + ErrStr.CreateDataError}
//         }
//
//     }
//
//
//     static async searchContractsNoPage(req: Request, res: Response) {
//         try {
//             const {searchKey} = req.body.dto
//             const result = await gDB.getRepository(Contract).find({
//                     relations: {
//                         customer: true,
//                         sales: true,
//                         product: true,
//                         head: true,
//                         files: true,
//                         mainContract: true,
//                         subContract: true
//                     },
//                     order: {
//                         createdAt: 'DESC'
//                     },
//                     where: [
//                         {
//                             customer: {
//                                 firstName: Like(`%${searchKey}%`)
//                             }
//                         },
//                         {
//                             customer: {
//                                 lastName: Like(`%${searchKey}%`)
//                             }
//                         },
//                         {
//                             customer: {
//                                 nickName: Like(`%${searchKey}%`)
//                             }
//                         },
//                         {
//                             cid: Like(`%${searchKey}%`)
//                         }
//                     ]
//                 }
//             )
//
//             for (const contract of result) {
//                 if (contract.files) {
//                     contract.files = contract.files.filter(file => !file.isDelete)
//                 }
//                 let b64Img = noSignatureB64
//
//                 // Get signature
//                 const fullPath = await getAbsoluteFilePath(contract.head.partyBSignature, FileType.ContractSignatureImage)
//                 if (!fs.existsSync(fullPath)) {
//                     CLog.bad('Error: Signature not found')
//                 } else {
//                     const bitmap = fs.readFileSync(fullPath)
//                     b64Img = 'data:image/png;base64,' + bitmap.toString('base64')
//                 }
//                 contract.head['partyBSignatureImage'] = b64Img
//             }
//
//             return res.send({rs: true, data: result})
//
//         } catch (e) {
//             CLog.bad('Error in searchContractsNoPage', e.message)
//             return res.send({rs: false, message: ResError.InternalServerError + ErrStr.FoundDataError})
//         }
//     }
//
//
//     static async assignPaymentEmailToOneContract(req: Request, res: Response) {
//         try {
//             const {email, fname, lname, cid} = req.body.dto
//
//
//             const contract = await gDB.getRepository(Contract).findOne({
//                 where: {cid: cid}
//             })
//
//             if (!contract) {
//                 CLog.bad('contract not found in assignPaymentEmailToOneContract')
//                 return res.send({rs: false, message: ResError.InternalServerError + ErrStr.CreateDataError})
//             }
//
//
//             let paymentEmail = new ContractPaymentEmails()
//
//             const foundPaymentEmail = await gDB.getRepository(ContractPaymentEmails).findOne({
//                 where: {email: email}
//             })
//
//             //If the payment email is exist, remove all relation and create new one
//             if (!!foundPaymentEmail) {
//                 paymentEmail = foundPaymentEmail
//             } else {
//                 paymentEmail.email = email
//                 paymentEmail.fname = fname
//                 paymentEmail.lname = lname
//             }
//             paymentEmail.contracts = [contract]
//
//             await gDB.getRepository(ContractPaymentEmails).save(paymentEmail)
//
//
//             await gDB.createQueryBuilder().update(ContractPaymentLogs).set(
//                 {processStatus: PaymentProcessStatus.PENDING})
//                 .where({replyTo: email, isActive: true}).execute()
//
//             return res.send({rs: true, data: paymentEmail})
//
//         } catch (e) {
//             CLog.bad('Error in assignPaymentEmailToOneContract', e.message)
//             return res.send({rs: false, message: ResError.InternalServerError + ErrStr.CreateDataError})
//         }
//     }
//
//
//     static async fetchSinglePaymentLog(req: Request, res: Response) {
//         const {pid} = req.body
//         if (!pid || typeof pid !== 'number') {
//             return res.send({rs: false, message: ResError.NotAcceptable})
//         }
//         try {
//             const foundPaymentlog = await gDB.getRepository(ContractPaymentLogs).findOneBy({id: pid})
//             const foundPaymentEmail = await gDB.getRepository(ContractPaymentEmails).findOne(
//                 {
//                     relations: {
//                         contracts: {
//                             customer: true,
//                             sales: true,
//                             product: true,
//                             head: true,
//                             files: true,
//                             mainContract: true,
//                             subContract: true
//                         }
//                     },
//                     where: {email: foundPaymentlog.replyTo}
//                 })
//
//             let recommendContracts = []
//             const searchKey = foundPaymentlog.payerName.trim().split(' ')
//             if (searchKey.length !== 0) {
//                 try {
//                     let foundContracts = await gDB.getRepository(Contract)
//                         .createQueryBuilder('contract')
//                         .leftJoinAndSelect('contract.customer', 'user')
//                         .leftJoinAndSelect('contract.currency', 'currency')
//                         .leftJoinAndSelect('contract.head', 'head')
//                         .leftJoinAndSelect('contract.files', 'file')
//                         .leftJoinAndSelect('contract.mainContract', 'mainContract')
//                         .leftJoinAndSelect('contract.subContract', 'subContract')
//                         .leftJoinAndSelect('contract.product', 'product')
//                         .where('contract.isActive = true AND contract.remaining > 0 AND (contract.email = :email OR contract.email LIKE :likeEmail OR (user.firstName  IN (:searchKey) AND user.lastName IN (:searchKey)))',
//                             {
//                                 email: foundPaymentlog.replyTo,
//                                 likeEmail: `%${foundPaymentlog.replyTo.split('@')[0]}%`,
//                                 searchKey: searchKey
//                             })
//                         .getMany()
//
//
//                     for (const contract of foundContracts) {
//                         if (contract.files) {
//                             contract.files = contract.files.filter(file => !file.isDelete)
//                         }
//                         let b64Img = noSignatureB64
//
//                         // Get signature
//                         const fullPath = await getAbsoluteFilePath(contract.head.partyBSignature, FileType.ContractSignatureImage)
//                         if (!fs.existsSync(fullPath)) {
//                             CLog.bad('Error: Signature not found')
//                         } else {
//                             const bitmap = fs.readFileSync(fullPath)
//                             b64Img = 'data:image/png;base64,' + bitmap.toString('base64')
//                         }
//                         contract.head['partyBSignatureImage'] = b64Img
//                     }
//                     recommendContracts = [...foundContracts]
//                 } catch (e) {
//                     CLog.bad('error in __linkRecommendedContract', e.message)
//                 }
//             }
//             let result = {
//                 paymentLog: foundPaymentlog,
//                 paymentEmail: foundPaymentEmail ?? {},
//                 recommendContracts: recommendContracts
//             }
//
//             return res.send({rs: true, data: result})
//
//         } catch (e) {
//             CLog.bad('Error in fetchSignlePaymentLog', e.message)
//             return res.send({rs: false, message: ResError.InternalServerError + ErrStr.FoundDataError})
//         }
//     }
//
//
//     static async createPaymentHistoryFromLog(req: Request, res: Response) {
//         const {cid, pid, amountPaying} = req.body.dto
//         const amount = convertToCents(amountPaying)
//         try {
//             const foundContract = await gDB.getRepository(Contract).findOne({
//                 relations: {
//                     contractPaymentHistory: true
//                 },
//                 where: {cid: cid}
//
//             })
//
//             const foundPaymentLog = await gDB.getRepository(ContractPaymentLogs).findOne({
//                 where: {id: pid}
//             })
//
//             if (amount <= 0) {
//                 return res.send({rs: false, message: 'Request failed, amount should be greater than 0'})
//             }
//
//
//             if (amount > foundContract.remaining) {
//                 return res.send({rs: false, message: 'Request failed, amount is greater than contract remaining'})
//             }
//
//
//             if (amount > foundPaymentLog.unusedAmount) {
//                 return res.send({rs: false, message: 'Request failed, amount is greater than PaymentLog remaining'})
//             }
//
//
//             let paymentHistory = new ContractPaymentHistory()
//
//             paymentHistory.cid = cid
//             paymentHistory.email = foundPaymentLog.replyTo
//             paymentHistory.amount = amount
//             paymentHistory.contractPaymentLog = foundPaymentLog
//             paymentHistory.contract = foundContract
//             paymentHistory.paymentType = PaymentTypes.EMAIL_TRANSFER
//             paymentHistory.currency = Currency.CANADIAN_DOLLAR
//             paymentHistory.payerName = foundPaymentLog.payerName
//             paymentHistory.receiveTime = JSON.stringify(new Date())
//             paymentHistory.conversionRate = '1'
//             paymentHistory.referenceNumber = foundPaymentLog.referenceNumber
//             paymentHistory.amountInCAD = amount
//
//             if (foundPaymentLog.unusedAmount === amount) {
//                 foundPaymentLog.processStatus = PaymentProcessStatus.PROCESSED
//             }
//
//             // foundPaymentLog.paymentHistories = [...foundPaymentLog.paymentHistories,paymentHistory]
//             foundPaymentLog.usedAmount += amount
//             foundPaymentLog.unusedAmount -= amount
//             foundContract.remaining -= amount
//             // foundContract.contractPaymentHistory = [...foundContract.contractPaymentHistory,paymentHistory]
//
//
//             let error = [...await validate(paymentHistory), ...await validate(foundPaymentLog), ...await validate(foundContract)]
//             if (error.length > 0) {
//                 CLog.bad('Error in createPaymentHistoryFromLog', error)
//                 return res.send({rs: false, message: 'Create Payment History Failed'})
//             }
//
//             await Promise.all([gDB.getRepository(ContractPaymentHistory).save(paymentHistory),
//                 gDB.getRepository(Contract).save(foundContract),
//                 gDB.getRepository(ContractPaymentLogs).save(foundPaymentLog)
//             ])
//
//
//             return res.send({rs: true, data: paymentHistory})
//         } catch (e) {
//             CLog.bad('Error in createPaymentHistoryFromLog', e.message)
//             return res.send({rs: false, message: 'Create Payment History Failed'})
//         }
//     }
//
//
//     static async __handleContractPaymentFile(singleFile, contractPaymentHistoryId) {
//         try {
//             if (singleFile && !Array.isArray(singleFile)) {
//                 // Error checking
//                 if (!singleFile.mimetype.startsWith('image')) {
//                     CLog.bad('Error in __handleContractPaymentFile, not an image')
//                     return {rs: false, message: 'File Type Error. The uploaded file is not an image.'}
//                 }
//                 const [isFileCheckNotPass, message] = await checkFileIsOverSize(singleFile, 'max_file_size')
//                 if (isFileCheckNotPass) {
//                     CLog.bad('Error in __handleContractPaymentFile, file size error')
//                     return {rs: false, message: 'File size must be less than ' + message}
//                 }
//
//                 // Save file
//                 const savedFile = await saveFile(singleFile, FileType.ContactPaymentFile, contractPaymentHistoryId)
//                 return {rs: true, data: savedFile}
//             }
//         } catch (e) {
//             CLog.bad('Error in __handleContractPaymentFile', e.message)
//             return {rs: false, message: 'Error in __handleContractPaymentFile'}
//         }
//     }
//
//     static async createPaymentReceiver(req: Request, res: Response, next: NextFunction) {
//         try {
//             let {user, password, bank, name, host, port}: CreatePaymentReceiverDto = req.body.dto
//             let paymentReceiver = await gDB.getRepository(ContractPaymentReceiver).create(
//                 {user, password, bank, name, host, port}
//             ).save()
//             await ContractController.__redisUpdatePaymentReceiver()
//             return res.send({rs: true, message: `Payment Receiver created successfully`})
//         } catch (e) {
//             CLog.bad('Error in createPaymentReceiver', e.message)
//             return res.send({rs: false, message: `Create Payment Receiver error`})
//         }
//     }
//
//     static async fetchPaymentReceiver(req: Request, res: Response, next: NextFunction) {
//         try {
//             let paymentReceiverList = await gDB.getRepository(ContractPaymentReceiver).find({where: {isDelete: false}})
//             return res.send({rs: true, message: `Payment Receiver fetched successfully`, data: paymentReceiverList})
//         } catch (e) {
//             CLog.bad('Error in fetchPaymentReceiver', e.message)
//             return res.send({rs: false, message: `Fetch Payment Receiver error`})
//         }
//     }
//
//     static async updatePaymentReceiver(req: Request, res: Response) {
//         const {ids, isActive}: UpdatePaymentReceiverDto = req.body.dto
//         try {
//             await gDB.createQueryBuilder()
//                 .update(ContractPaymentReceiver)
//                 .set({isActive})
//                 .where({id: In(ids)})
//                 .execute()
//             await ContractController.__redisUpdatePaymentReceiver()
//             return res.send({rs: true, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error when updatePaymentReceivers', e.message)
//             return res.send({rs: false, message: 'Payment Receiver updating error'})
//         }
//     }
//
//     static async __redisUpdatePaymentReceiver() {
//         try {
//             let paymentReceiverList = await gDB.getRepository(ContractPaymentReceiver).find(
//                 {where: {isActive: true}}
//             )
//             await global.redisEmailPaymentClient.del(MailWorkerRedisKeys.CONTRACT_PAYMENT_EMAIL_TIMESTAMP_LIST)
//             await global.redisEmailPaymentClient.del(process.env.PAYMENT_RECEIVER_LIST_NAME)
//             await Promise.all(paymentReceiverList.map((email) => {
//                 return global.redisEmailPaymentClient.rPush(process.env.PAYMENT_RECEIVER_LIST_NAME, JSON.stringify(email)).then(
//                     () => {
//                         CLog.ok('success, Redis Payment Receivers updated')
//                     }
//                 )
//             }))
//         } catch (e) {
//             CLog.bad('Error when redisUpdatePaymentReceivers', e.message)
//         }
//     }
//
//     static async getPaymentLogHtml(req: Request, res: Response) {
//         const referenceNumber = req.body.referenceNumber
//
//         try {
//             // const foundLog = await gDB.getRepository(ContractPaymentLogs).findOne({
//             //     // relations: ['customer'],
//             //     where: {id: pid, isDelete: false}
//             // })
//
//             const fileName = `${referenceNumber}.html`
//             const fullPath = await getAbsoluteFilePath(fileName, FileType.PaymentLogHTMLFile)
//             if (!fs.existsSync(fullPath)) {
//                 return sendResError(res, ResError.NotFound)
//             }
//             return res.download(fullPath, fileName)
//         } catch (e) {
//             CLog.bad('Error in getPaymentLogHtml', e.message)
//             return sendResError(res, ResError.InternalServerError, `Error in get contract`)
//         }
//     }
//
//     static async fetchDefaultContractTerms(req: Request, res: Response) {
//         try {
//             const allDefaultTerms = await super.repo(ContractTerm).find(
//                 {
//                     where: {
//                         isActive: true,
//                         isDelete: false,
//                         isDefault: true
//                     }
//                 }
//             )
//             return res.send({rs: true, data: allDefaultTerms})
//         } catch (e) {
//             CLog.bad('Error in fetchDefaultContractTerms', e.message)
//             return res.send({rs: false, message: 'Error in fetchDefaultContractTerms'})
//         }
//     }
//
//     static async fetchTermById(req: Request, res: Response) {
//         try {
//             const {id} = req.params
//
//             if (!canNum(id)) {
//                 return {rs: false, message: 'invalid contract term id'}
//             }
//             const one = await gDB.getRepository(ContractTerm).findOne({where: {id: +id}})
//
//
//             return res.send({rs: true, data: one})
//         } catch (e) {
//             CLog.bad('Error in fetchTermById', e.message)
//             return res.send({rs: false, message: 'Error in fetchTermById'})
//         }
//     }
//
//     static async fetchFilterTermsList(req: Request, res: Response) {
//         try {
//             let searchKey: string = req.body?.searchKey
//
//             searchKey = searchKey.trim()
//
//             if (searchKey === '' || searchKey === undefined) {
//
//                 const termsList = await gDB.getRepository(ContractTerm)
//                     .find({
//                         where: {isDelete: false, isActive: true}
//                     })
//                 return res.send({rs: true, data: termsList, message: 'Invalid search key'})
//             }
//
//             const termsList = await gDB.getRepository(ContractTerm)
//                 .createQueryBuilder('term')
//                 .where('term.title LIKE :title', {title: `%${searchKey}%`})
//                 .orWhere('term.text LIKE :text', {text: `%${searchKey}%`})
//                 .getMany()
//
//             return res.send({rs: true, data: termsList})
//
//         } catch (e) {
//             CLog.bad(`Error in fetchFilterTermsList, `, e)
//             return res.send({rs: false, data: [], message: `Error in fetchFilterTermsList`})
//         }
//     }
//
//     static async fetchTermsBeSelected(req: Request, res: Response) {
//         const {ids} = req.body
//
//         try {
//             const termList = await gDB.getRepository(ContractTerm)
//                 .find({where: {id: In(ids)}})
//
//             return res.send({rs: true, data: termList, message: 'OK'})
//         } catch (e) {
//             CLog.bad('Error when updatePaymentReceivers', e.message)
//             return res.send({rs: false, message: 'Payment Receiver updating error'})
//         }
//     }
//
//     // Contract Terms
//
//     static async fetchAllContractTermsByPage(req: Request, res: Response) {
//         const {
//             page,
//             perPage,
//             sortColumn,
//             sortOrder,
//             searchKey,
//             previous,
//             next, category
//         }: FetchContractTemplateDto = req.body.dto
//
//         const entity = ContractTerm
//         const searchCols = pG.SEARCH_CONTRACT_TERM_COLUMN
//         const defaultSearchCol = pG.DEFAULT_TERM_SEARCH_COL
//         const filters = pG.TERM_FILTERS
//
//         try {
//             let {queryBuilder, alias} = super.queryBuilderAndLeftJoin(entity)
//             const props: PaginationParams = {
//                 queryBuilder,
//                 entity,
//                 page,
//                 perPage,
//                 sortCol: sortColumn,
//                 sortOrder,
//                 searchCols: searchCols.map(attr => dotConcat(alias, attr)),
//                 searchKey,
//                 filters,
//                 previous,
//                 next,
//                 defaultSortCol: pG.DEFAULT_SORT_COL,
//                 defaultSearchCol
//             }
//             const result = await fetchPaginatedData(props)
//
//             return res.send(result)
//         } catch (e) {
//             CLog.bad('fetchAllContractTemplatesByPage Error:', e.message)
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//     }
//
//     static async updateContractTermStatus(req: Request, res: Response) {
//         const {ids, isActive, isDelete}: UpdateContractTemplateStatus = req.body.dto
//         const message = 'OK'
//
//         try {
//             const contractTerms = await gDB.getRepository(ContractTerm).findBy({
//                 id: In(ids)
//             })
//             if (!contractTerms || contractTerms.length === 0) {
//                 CLog.bad('No Terms to update')
//                 return res.send({rs: false, message: 'No Terms to update'})
//             }
//
//             const updateResult = await gDB
//                 .createQueryBuilder()
//                 .update(ContractTerm)
//                 .set({isActive, isDelete})
//                 .where({id: In(ids)})
//                 .execute()
//
//             return res.send({
//                 rs: true,
//                 message: isActive ? `enable ${updateResult.affected} terms` : `disable ${updateResult.affected} terms`
//             })
//         } catch (e) {
//             CLog.bad('Error when updateContractTemplateStatus', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//
//     static async createContractTerm(req: Request, res: Response) {
//         const {title, slug, text, description, isDefault}: CreateContractTermDto = req.body.dto
//
//         try {
//             const isTermExist = await gDB.getRepository(ContractTerm).findOne({
//                 where: {
//                     title, slug
//                 }
//             })
//
//             if (isTermExist) {
//                 return res.send({rs: false, message: 'Term title or slug already exists'})
//             }
//             let convertDefault = false
//             if (!isDefault) {
//                 return res.send({rs: false, message: 'IsDefault Value should be set '})
//             } else {
//                 isDefault === 'true' ? convertDefault = true : convertDefault = false
//
//             }
//
//             const x = await super
//                 .repo(ContractTerm).create(
//                     {
//                         title: title.trim(),
//                         slug: slug.trim(),
//                         description: description.trim(),
//                         text,
//                         isActive: true,
//                         isDelete: false,
//                         isDefault: convertDefault
//                     }
//                 ).save()
//
//
//             return res.send({rs: true, data: x, message: 'create a new contract term'})
//         } catch (e) {
//
//             CLog.bad('Error Contract template name already exists', e.message)
//             return res.send({rs: false, message: 'Contract template name already exists'})
//
//         }
//     }
//
//     static async updateContractTerm(req: Request, res: Response) {
//         const {title, slug, text, description, isDefault, id}: UpdateContractTermDto = req.body.dto
//
//         try {
//             //check if term with the id exists
//             const contractTerm = await gDB.getRepository(ContractTerm).findOneBy({id: +id})
//             if (!contractTerm) {
//                 return res.send({
//                     rs: false,
//                     message: `contract term with id:${id} not found`
//                 })
//             }
//             //check slug or title exist
//             const isTitleOrSlug = await gDB.getRepository(ContractTerm).findOne({
//                 where: {
//                     title,
//                     slug,
//                     id: Not(+id)
//                 }
//
//             })
//             if (isTitleOrSlug) {
//                 return res.send({
//                     rs: false,
//                     message: `Slug Or Title already exists.`
//                 })
//             }
//
//             let convertDefault = false
//             if (!isDefault) {
//                 return res.send({rs: false, message: 'IsDefault Value should be set '})
//             } else {
//                 isDefault === 'true' ? convertDefault = true : convertDefault = false
//
//             }
//             contractTerm.title = title.trim()
//             contractTerm.slug = slug.trim()
//             contractTerm.description = description.trim()
//             contractTerm.text = text
//             contractTerm.isActive = true
//             contractTerm.isDelete = false
//             contractTerm.isDefault = convertDefault
//
//             const isSave = await contractTerm.save()
//
//             return res.send({rs: true, data: isSave, message: `Update product Id ${id}`})
//         } catch (e) {
//             CLog.bad('Error when updateContractTerm', e.message)
//             return res.send({rs: false, message: ErrStr.UpdateDataError})
//         }
//     }
//
//     static async fetchContractTerm(req: Request, res: Response) {
//         const termId = +req.params.id
//
//
//         if (!canNum(termId)) {
//             return {rs: false, message: 'invalid contract term id'}
//         }
//
//         const contractTerm = await gDB.getRepository(ContractTerm).findOne({where: {id: termId, isDelete: false}})
//         if (!contractTerm) {
//             return res.send({rs: false, message: ErrStr.FoundDataError})
//         }
//
//         return res.send({rs: true, data: contractTerm})
//     }
//
// }
//
//
// export default ContractController
