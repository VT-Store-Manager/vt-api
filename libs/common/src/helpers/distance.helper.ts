type Coordinate = {
	lat: number
	lng: number
}

const rad = (x: number) => {
	return (x * Math.PI) / 180
}

export const getDistance = function (p1: Coordinate, p2: Coordinate): number {
	const R = 6378137 // Earth’s mean radius in meter
	const dLat = rad(p2.lat - p1.lat)
	const dLong = rad(p2.lng - p1.lng)
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat)) *
			Math.cos(rad(p2.lat)) *
			Math.sin(dLong / 2) *
			Math.sin(dLong / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const d = R * c
	return d // returns the distance in meter
}
