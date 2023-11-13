// import * as express from 'express';
// import {NextFunction, Request, Response} from 'express';
// import {validateOrReject, ValidationError} from "class-validator";
// import {ResError, sendResError} from "../helper/ResponseError";
// import {Functions} from "../helper/FunctionEnum";
// import {AuthCache} from "../cache/AuthCache";
// import {User} from "../entity/user.entity";
// import {getRemoteAction, OnlineUserStatus} from "../helper/ReqContext";
// import {getMatrixApi} from "../helper/MatrixHeader";
// import {CLog} from "../../AppHelper";
//
// const authCache = AuthCache.getInstance();
//
// //after validateBody req.body.dto will has Dto Object
// export function validateBody(Dto): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const dto = new Dto();
//         Object.keys(req.body).forEach(key => {
//             if (key !== 'validatedData' && key!=='relations') {
//                 dto[key] = req.body[key]
//             }
//         })
//         validateOrReject(dto).then(_ => {
//             req.body.dto = dto;
//             next();
//         }).catch(errors => {
//             CLog.bad("validateBody errors!, ", errors);
//             sendResError(res, ResError.NotAcceptable, errors)
//         });
//     }
// }
// export function validateParams(Dto): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const dto = new Dto();
//         Object.keys(req.params).forEach(key => {
//             if (key !== 'validatedData' && key!=='relations') {
//                 dto[key] = req.params[key]
//             }
//         })
//         validateOrReject(dto).then(_ => {
//             req.body.paramsDto = dto;
//             next();
//         }).catch(errors => {
//             CLog.bad("validateParams errors!, ", errors);
//             sendResError(res, ResError.NotAcceptable, errors)
//         });
//     }
// }
// export interface ValidatedData {
//     token?: string;
//     user: User;
// }
//
// export function checkAuthFromMatrix(functionId:number): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//
//         const api = await getMatrixApi(req);
//         try {
//             CLog.info("checkAuto:", `/auth/authTest/${functionId}`);
//             const response = await api.get(`/auth/authTest/${functionId}`)
//             if (response.data) {
//                 const {rs} = response.data;
//                 if(rs){
//                     next();
//                 }else{
//                     sendResError(res, ResError.Unauthorized);
//                 }
//             }
//         } catch (e) {
//             CLog.bad(`checkAuth from Matrix Error, `, e)
//             sendResError(res, ResError.Unauthorized);
//         }
//     }
// }
// export function validateToken(): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const api = await getMatrixApi(req);
//         try {
//             const response = await api.post(`/auth/authCheck`)
//             if (response.data) {
//                 //
//                 //todo here need to verify token first!!!!, if token is not valid, failed ALL!!!
//
//                 const {user,token} = response.data;
//                 //set online user
//                 const userAction = await getRemoteAction(req);
//
//                 userAction.status = OnlineUserStatus.Online;
//                 userAction.id = user.id;
//                 userAction.name = `${user.firstName} ${user.lastName}`;
//                 authCache.setUser(user.appId,userAction);
//                 //set body
//                 req.body.validatedData = response.data;
//                 /*
//                 companyId,appId,roleId will be removed
//                  */
//                 req.body.relations = {companyId:1 ,roleId:user.roleId, roleIds: user.roleIds, userId:user.id, appId:user.appId}
//                 next();
//             }
//         } catch (e) {
//             //console.log(e);
//             sendResError(res, ResError.Unauthorized);
//         }
//     }
// }
//
// export function validateTokenAndNext(): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const api = await getMatrixApi(req);
//         try {
//             const response = await api.post(`/auth/authCheck`)
//             if (response.data) {
//                 const {user,token} = response.data;
//                 //set online user
//                 const userAction = getRemoteAction(req);
//                 userAction.status = OnlineUserStatus.Online;
//                 userAction.id = user.id;
//                 userAction.name = `${user.firstName} ${user.lastName}`;
//                 authCache.setUser(user.appId,userAction);
//                 //set body
//                 req.body.validatedData = response.data;
//                 /*
//                 companyId,appId,roleId will be removed
//                  */
//                 req.body.relations = {companyId:1 ,roleId:user.roleId, roleIds: user.roleIds, userId:user.id, appId:user.appId}
//                 next();
//             }
//         } catch (e) {
//             //console.log(e);
//             next();
//         }
//     }
// }
//
//
//
// //this is must be put after validateToken() , no db accessing needed if there is a cache.
// // after validateTokenWithoutCheckDB() will not working
// export function authValidator(functionId: Functions): express.RequestHandler {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const api = await getMatrixApi(req);
//         try {
//             const response = await api.get(`/auth/authTest/${functionId}`)
//             if (response.data) {
//                 const {rs} = response.data;
//                 if(rs){
//                     next();
//                 }else{
//                     sendResError(res, ResError.Unauthorized);
//                 }
//             }
//         } catch (e) {
//             //console.log(e);
//             sendResError(res, ResError.Unauthorized);
//         }
//
//     }
//
// }
//
// // export function validateTokenWithoutCheckDB(): express.RequestHandler {
// //     return async (req: Request, res: Response, next: NextFunction) => {
// //         const tokenStr = req.headers[Config.tokenHeader] as string;
// //         try {
// //             const [discard, token] = tokenStr.split(' ')
// //             jwt.verify(token, Config.seedPassword)
// //             next()
// //         } catch (e) {
// //             return sendResError(res, ResError.Unauthorized)
// //         }
// //     }
// //
// // }
// /*
// sample code for validateProject
//  */
// // export function validateProject(): express.RequestHandler {
// //     return async (req: Request, res: Response, next: NextFunction) => {
// //         const project = req.body.project
// //         if (project) {
// //             const found = await gDB.getRepository(Project).findOne({id:project})
// //             if (found) {
// //                 //req.body.validatedData.Project = found;
// //                 next();
// //             } else {
// //                 return sendResError(res, ResError.NotAcceptable,"Current Project status dose not accepted worksheet.");
// //             }
// //         } else {
// //             return sendResError(res, ResError.NotAcceptable,"Key Parameter project is missing");
// //         }
// //     }
// //
// // }
//
// // This middleware handles the case where our validation
// // middleware says the request failed validation. We return
// // those errors to the client here.
// export function validationError(err: Error, req, res, next) {
//     if (err instanceof Array && err[0] instanceof ValidationError) {
//         res.status(400).json({errors: err}).end();
//     } else {
//         next(err);
//     }
// }
