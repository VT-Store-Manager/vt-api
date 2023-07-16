import { Request, Response } from 'express'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import pick from 'lodash/pick'
import morgan from 'morgan'
import path from 'path'
import { createStream } from 'rotating-file-stream'

import { INestApplication } from '@nestjs/common'

const _logSuccessPath = () => {
	return createStream(
		(time: Date, _index?: number) => {
			if (!time) time = new Date()

			const date = time.toISOString().split('T')[0]
			return `${date}_access.log`
		},
		{
			interval: '1d',
			path: path.join(__dirname, '..', 'storage', 'log', 'access'),
		}
	)
}
const _logErrorPath = () => {
	return createStream(
		(time: Date, _index?: number) => {
			if (!time) time = new Date()

			const date = time.toISOString().split('T')[0]
			return `${date}_error.log`
		},
		{
			interval: '1d',
			path: path.join(__dirname, '..', 'storage', 'log', 'error'),
		}
	)
}

const getRequestData = (req: Request, _res: Response): string => {
	const requestData = {
		headers: pick(req.headers, [
			'origin',
			'content-type',
			'authorization',
			'user-agent',
			'sec-ch-ua-platform',
		]),
		...pick(req, ['params', 'query', 'body']),
	}

	return JSON.stringify(omitBy(requestData, isEmpty), null, 2).replace(
		/"([^"]+)":/g,
		'$1:'
	)
}

export const morganConfig = (app: INestApplication) => {
	morgan.token('request-data', getRequestData)

	morgan.token('response-data', (req: Request, res: Response) => {
		return JSON.stringify(res['_data'], null, 2).replace(/"([^"]+)":/g, '$1:')
	})

	// 	app.use(
	// 		morgan(
	// 			':remote-addr [:date[iso]] - :method :url :status - :response-time ms',
	// 			{
	// 				stream: logSuccessPath(),
	// 				skip: (req: Request, res: Response) => {
	// 					return (
	// 						res.statusCode >= 400 ||
	// 						(req.method.toUpperCase() === 'GET' && req.url.includes('/file/'))
	// 					)
	// 				},
	// 			},
	// 			{ flags: 'a' }
	// 		)
	// 	)
	// 	app.use(
	// 		morgan(
	// 			`:remote-addr [:date[iso]] - :method :url :status - :res[content-length] bytes - :response-time ms
	// Request: :request-data
	// Response: :response-data
	// =====================
	// `,
	// 			{
	// 				stream: logErrorPath(),
	// 				skip: (res: Request, req: Response) => {
	// 					return req.statusCode < 400
	// 				},
	// 			},
	// 			{ flags: 'a' }
	// 		)
	// 	)
	app.use(
		morgan('dev', {
			skip: (req: Request, res: Response) => {
				return (
					res.statusCode < 400 &&
					req.method.toUpperCase() === 'GET' &&
					req.url.includes('/file/')
				)
			},
		})
	)
}
