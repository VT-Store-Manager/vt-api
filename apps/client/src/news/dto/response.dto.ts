export class NewsListByTagItemDTO {
	id: string
	name: string
	news: NewsListItemDTO[]
}

export class NewsListItemDTO {
	id: string
	name: string
	image: string
	content: string
	url: string
	time: number
}
