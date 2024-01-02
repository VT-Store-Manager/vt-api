import { EnvConfigType } from '@app/config'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	Client,
	LatLng,
	Status,
	TravelMode,
} from '@googlemaps/google-maps-services-js'
import { Coordinate, getDistance } from '../../helpers'

@Injectable()
export class GoogleMapService {
	private apiKey: string
	constructor(private readonly configService: ConfigService<EnvConfigType>) {
		this.apiKey = this.configService.get('google.googleMapApiKey', {
			infer: true,
		})

		if (!this.apiKey) return

		const logger = new Logger('GoogleMapService')
		this.ping()
			.then(() => {
				logger.debug('Google Map API connected')
			})
			.catch(() => {
				logger.error('Google Map API cannot connect')
			})
	}

	ping() {
		const client = new Client({})
		return client.geolocate({
			data: {},
			params: {
				key: this.apiKey,
			},
		})
	}

	async getRouteDistance(from: LatLng, to: LatLng) {
		if (!this.apiKey) return null

		const client = new Client({})
		try {
			const { data } = await client.distancematrix({
				params: {
					key: this.apiKey,
					origins: [from],
					destinations: [to],
					mode: TravelMode.driving,
				},
			})
			if (data.status !== Status.OK) {
				return null
			}
			return data
		} catch (err) {
			return null
		}
	}

	async getShipDistance(from: Coordinate, to: Coordinate): Promise<number> {
		const distanceMatrix = await this.getRouteDistance(from, to)

		const deliveryDistance =
			distanceMatrix?.rows?.[0].elements?.[0].distance.value ??
			getDistance(from, to)

		return deliveryDistance
	}
}
