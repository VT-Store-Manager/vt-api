export const imageUrl = '/api/v1/file/render?key='

/**
 * It returns the file extension of a given filename
 * @param {string} filename - The name of the file you want to get the extension of.
 * @returns The file extension of the file name.
 */
export const getFileExtension = (filename: string) => {
	const dot = filename.lastIndexOf('.')
	return dot === -1 ? '' : filename.slice(dot)
}
