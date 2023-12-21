import chalk from 'chalk'
import { Request, Response } from 'express'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import pick from 'lodash/pick'
import moment from 'moment'
import morgan from 'morgan'
import path from 'path'
import { createStream } from 'rotating-file-stream'

import { adminPasswordUid } from '@app/common'
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
			immutable: true,
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

export const morganConfig = async (app: INestApplication) => {
	app.use((req, res, next) => {
		req.id = adminPasswordUid()
		next()
	})
	morgan.token('request-id', req => {
		return req.id
	})
	morgan.token('request-data', getRequestData)
	morgan.token('response-data', (req: Request, res: Response) => {
		return JSON.stringify(res['_data'], null, 2).replace(/"([^"]+)":/g, '$1:')
	})
	morgan.token('moment-time', () =>
		moment().format('ddd YYYY-MM-DD HH:mm:ss.SSS Z')
	)

	// Success log morgan
	// 	app.use(
	// 		morgan(
	// 			`:request-id :remote-addr :remote-user [:moment-time] - :method :url :status - :res[content-length] B - :response-time ms`,
	// 			{
	// 				stream: _logSuccessPath(),
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

	// 	// Error log morgan
	// 	app.use(
	// 		morgan(
	// 			`:request-id :remote-addr :remote-user [:moment-time] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent" - :response-time ms
	// REQUEST: :request-data

	// RESPONSE: :response-data
	// =====================

	// `,
	// 			{
	// 				stream: _logErrorPath(),
	// 				skip: (res: Request, req: Response) => {
	// 					return req.statusCode < 400
	// 				},
	// 			},
	// 			{ flags: 'a' }
	// 		)
	// 	)

	// Terminal log morgan
	app.use(
		morgan(
			(tokens, req, res) => {
				const method = (tokens.method(req, res) as string)?.toUpperCase()
				const methodColor =
					method === 'POST'
						? chalk.yellow
						: method === 'PUT'
						? chalk.blue
						: method === 'DELETE'
						? chalk.red
						: method === 'OPTIONS'
						? chalk.magenta
						: chalk.green
				const status = +tokens.status(req, res)
				const statusColor =
					status < 200
						? chalk.blueBright
						: status < 300
						? chalk.greenBright
						: status < 400
						? chalk.yellowBright
						: status < 500
						? chalk.redBright
						: chalk.red
				const url = (tokens.url(req, res) as string).split('?')
				const contentLength = tokens.res(req, res, 'content-length')

				return [
					...(req.id
						? [
								chalk.gray.italic.dim(
									`${req.id} ${moment().format('HH:mm:ss')}`
								),
						  ]
						: [
								chalk.gray.italic.dim(
									` ${moment().format('ddd YYYY/MM/DD HH:mm:ss.SSS Z')}  `
								),
						  ]),
					methodColor.bold(
						('       ' + method).slice(-Math.max(6, method.length))
					),
					statusColor.bold(status ?? '---'),
					chalk.white(url[0]) +
						(url?.[1] ? chalk.white.dim.italic(`?${url[1]}`) : ''),
					...(contentLength
						? ['-', chalk.magentaBright(contentLength + ' B')]
						: []),
					'-',
					chalk.cyan(`${tokens['response-time'](req, res) ?? 0} ms`),
				].join(' ')
			},
			{
				skip: (req: Request, res: Response) => {
					return (
						res.statusCode < 400 &&
						req.method.toUpperCase() === 'GET' &&
						req.url.includes('/file/')
					)
				},
			}
		)
	)
}
