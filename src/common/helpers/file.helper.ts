import { hostname } from 'os'

import { NodeEnv } from '../constants'

/**
 * It returns the file extension of a given filename
 * @param {string} filename - The name of the file you want to get the extension of.
 * @returns The file extension of the file name.
 */
export const getFileExtension = (filename: string) => {
	const dot = filename.lastIndexOf('.')
	return dot === -1 ? '' : filename.slice(dot)
}

export const getImagePath = (key: string) => {
	if (process.env.NODE_ENV !== NodeEnv.PRODUCTION) {
		return `${hostname()}:${process.env.PORT}/api/v1/file/render?key=${key}`
	}
	return `${hostname()}/api/v1/file/render?key=${key}`
}
