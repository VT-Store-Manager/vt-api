import ShortUniqueId from 'short-unique-id'

const optionItemKeyUid = new ShortUniqueId({ length: 6 })
optionItemKeyUid.setDictionary('alpha_lower')

const s3KeyUid = new ShortUniqueId({ length: 8 })
s3KeyUid.setDictionary('number')

export { optionItemKeyUid, s3KeyUid }
